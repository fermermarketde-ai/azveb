import { prisma } from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth";
import { clearGeminiKeyCache } from "@/lib/gemini";

const DEFAULT_MODULES = [
  { id: "agronomist", name: "AI Aqronomist", description: "Bitki xəstəliklərini şəkil + mətn ilə analiz edir, məhsul tövsiyə edir", endpoint: "/api/ai/agronomist", page: "/agronom", icon: "sprout", isDefault: true },
  { id: "suggest-listing", name: "AI Elan Təklifi", description: "Məhsul şəkli/təsvirindən avtomatik elan başlığı və təsviri yaradır", endpoint: "/api/ai/suggest-listing", icon: "sparkles", isDefault: true },
  { id: "price-index", name: "AI Qiymət Proqnozu", description: "Bazar qiymətlərinin gələcək proqnozu", endpoint: "/api/ai/price-index", icon: "trendingUp", isDefault: true },
];

// Supported AI providers
const AI_PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    keySettingKey: "geminiApiKey",
    envVar: "GEMINI_API_KEY",
    keyPrefix: "AIzaSy",
    placeholder: "AIzaSy...",
    helpUrl: "https://aistudio.google.com/app/apikey",
    helpText: "Pulsuz açar: aistudio.google.com/app/apikey",
    icon: "sparkles",
    color: "blue",
    testEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    keySettingKey: "openaiApiKey",
    envVar: "OPENAI_API_KEY",
    keyPrefix: "sk-",
    placeholder: "sk-proj-...",
    helpUrl: "https://platform.openai.com/api-keys",
    helpText: "Açar almaq: platform.openai.com/api-keys",
    icon: "bot",
    color: "emerald",
    testEndpoint: "https://api.openai.com/v1/chat/completions",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1-mini", "o1-preview"],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    keySettingKey: "anthropicApiKey",
    envVar: "ANTHROPIC_API_KEY",
    keyPrefix: "sk-ant-",
    placeholder: "sk-ant-api03-...",
    helpUrl: "https://console.anthropic.com/settings/keys",
    helpText: "Açar almaq: console.anthropic.com/settings/keys",
    icon: "zap",
    color: "amber",
    testEndpoint: "https://api.anthropic.com/v1/messages",
    models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    keySettingKey: "mistralApiKey",
    envVar: "MISTRAL_API_KEY",
    keyPrefix: "",
    placeholder: "Açar daxil edin...",
    helpUrl: "https://console.mistral.ai/api-keys",
    helpText: "Açar almaq: console.mistral.ai/api-keys",
    icon: "trendingUp",
    color: "violet",
    testEndpoint: "https://api.mistral.ai/v1/chat/completions",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "open-mistral-7b"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    keySettingKey: "deepseekApiKey",
    envVar: "DEEPSEEK_API_KEY",
    keyPrefix: "sk-",
    placeholder: "sk-...",
    helpUrl: "https://platform.deepseek.com/api_keys",
    helpText: "Açar almaq: platform.deepseek.com/api_keys",
    icon: "bot",
    color: "indigo",
    testEndpoint: "https://api.deepseek.com/v1/chat/completions",
    models: ["deepseek-chat", "deepseek-reasoner", "deepseek-coder"],
  },
];

function maskKey(key) {
  if (!key) return "";
  if (key.length <= 12) return key.slice(0, 4) + "••••••••" + key.slice(-2);
  return key.slice(0, 6) + "••••••••••••••••" + key.slice(-4);
}

export async function GET(request) {
  const authUser = await getAuthUser(request);
  const denied = requireRole(authUser, ["ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  try {
    const settings = await prisma.setting.findMany({ where: { category: "ai" } });
    const map = {};
    for (const s of settings) map[s.key] = s.value;

    // Build providers with key status
    const providers = AI_PROVIDERS.map(p => {
      const dbKey = map[p.keySettingKey] || "";
      const envKey = process.env[p.envVar] || "";
      const activeKey = dbKey || envKey;
      return {
        ...p,
        dbKey: maskKey(dbKey),
        envKey: maskKey(envKey),
        hasKey: !!activeKey,
        keySource: dbKey ? "database" : (envKey ? "env" : "none"),
        models: p.models,
      };
    });

    const hasActiveKey = providers.some(p => p.hasKey);

    // Build modules list
    let modules = DEFAULT_MODULES.map(m => ({
      ...m,
      active: map[`module.${m.id}.active`] !== "false",
    }));

    // Add custom modules from DB
    for (const s of settings) {
      if (s.key.startsWith("module.") && s.key.endsWith(".config")) {
        try {
          const config = JSON.parse(s.value);
          if (config.id && !modules.find(m => m.id === config.id)) {
            modules.push({
              ...config,
              active: map[`module.${config.id}.active`] !== "false",
              isCustom: true,
            });
          }
        } catch (e) {}
      }
    }

    return Response.json({
      providers,
      hasActiveKey,
      modules,
    });
  } catch (error) {
    return Response.json({ error: "Ayarlar yüklənmədi: " + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const authUser = await getAuthUser(request);
  const denied = requireRole(authUser, ["ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { providerKey, apiKey, moduleId, moduleActive, newModule, deleteModuleId } = body;

    // 1. Update API key for a specific provider
    if (providerKey !== undefined && apiKey !== undefined) {
      const provider = AI_PROVIDERS.find(p => p.keySettingKey === providerKey);
      if (!provider) return Response.json({ error: "Naməlum provayder" }, { status: 400 });

      if (!apiKey.trim()) {
        // Delete the key
        await prisma.setting.deleteMany({ where: { key: provider.keySettingKey, category: "ai" } });
        if (provider.id === "gemini") clearGeminiKeyCache();
        return Response.json({ success: true, message: `${provider.name} açarı silindi` });
      }

      const trimmed = apiKey.trim();
      if (trimmed.length < 10) return Response.json({ error: "API açarı çox qısadır" }, { status: 400 });

      await prisma.setting.upsert({
        where: { key: provider.keySettingKey },
        update: { value: trimmed, category: "ai" },
        create: { key: provider.keySettingKey, value: trimmed, category: "ai" },
      });

      if (provider.id === "gemini") clearGeminiKeyCache();

      return Response.json({ success: true, message: `${provider.name} API açarı yeniləndi` });
    }

    // Legacy: geminiApiKey (backward compat)
    if (body.geminiApiKey !== undefined) {
      const apiKey = body.geminiApiKey;
      if (!apiKey.trim()) {
        await prisma.setting.deleteMany({ where: { key: "geminiApiKey", category: "ai" } });
        clearGeminiKeyCache();
        return Response.json({ success: true, message: "API açarı silindi — sistem env/offline rejimə keçəcək" });
      }
      const trimmed = apiKey.trim();
      if (trimmed.length < 20) return Response.json({ error: "API açarı çox qısadır" }, { status: 400 });
      await prisma.setting.upsert({
        where: { key: "geminiApiKey" },
        update: { value: trimmed, category: "ai" },
        create: { key: "geminiApiKey", value: trimmed, category: "ai" },
      });
      clearGeminiKeyCache();
      return Response.json({ success: true, message: "Gemini API açarı uğurla yeniləndi" });
    }

    // 2. Toggle module active/deactive
    if (moduleId && moduleActive !== undefined) {
      const key = `module.${moduleId}.active`;
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(moduleActive), category: "ai" },
        create: { key, value: String(moduleActive), category: "ai" },
      });
      return Response.json({ success: true, message: `Modul ${moduleActive ? "aktiv" : "deaktiv"} edildi` });
    }

    // 3. Add new custom module
    if (newModule) {
      if (!newModule.id || !newModule.name) return Response.json({ error: "Modul ID və adı tələb olunur" }, { status: 400 });
      const configKey = `module.${newModule.id}.config`;
      const existing = await prisma.setting.findUnique({ where: { key: configKey } });
      if (existing) return Response.json({ error: "Bu ID ilə modul artıq mövcuddur" }, { status: 400 });

      await prisma.setting.create({
        data: {
          key: configKey,
          value: JSON.stringify({
            id: newModule.id,
            name: newModule.name,
            description: newModule.description || "",
            endpoint: newModule.endpoint || "",
            icon: newModule.icon || "bot",
          }),
          category: "ai",
        },
      });
      await prisma.setting.create({
        data: { key: `module.${newModule.id}.active`, value: "true", category: "ai" },
      }).catch(() => {});
      return Response.json({ success: true, message: "Yeni AI modulu əlavə edildi" });
    }

    // 4. Delete custom module
    if (deleteModuleId) {
      await prisma.setting.deleteMany({
        where: { OR: [
          { key: `module.${deleteModuleId}.config` },
          { key: `module.${deleteModuleId}.active` },
        ] },
      });
      return Response.json({ success: true, message: "Modul silindi" });
    }

    return Response.json({ error: "Heç bir əməliyyat təyin edilmədi" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: "Yeniləmə uğursuz: " + error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authUser = await getAuthUser(request);
  const denied = requireRole(authUser, ["ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const providerId = body.providerId || "gemini";
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return Response.json({ success: false, message: "Naməlum provayder" });

    // Get API key from DB or env
    let apiKey = "";
    const dbSetting = await prisma.setting.findUnique({ where: { key: provider.keySettingKey } });
    if (dbSetting) apiKey = dbSetting.value;
    else apiKey = process.env[provider.envVar] || "";

    if (!apiKey) return Response.json({ success: false, message: `${provider.name} üçün açar təyin edilməyib` });

    // Test based on provider type
    if (providerId === "gemini") {
      const res = await fetch(
        `${provider.testEndpoint}?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Salam. Qısa cavab ver." }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 50, thinkingConfig: { thinkingBudget: 0 } },
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data?.candidates?.[0]) {
        const responseText = data.candidates[0].content?.parts?.map(p => p.text).join("") || "";
        return Response.json({ success: true, message: `${provider.name} işləyir!`, sample: responseText.slice(0, 100) });
      }
      return Response.json({ success: false, message: `API xətası: ${data?.error?.message || "Bilinməyən xəta"}` });
    }

    if (providerId === "openai" || providerId === "mistral" || providerId === "deepseek") {
      // OpenAI-compatible API
      const model = providerId === "openai" ? "gpt-4o-mini" : providerId === "mistral" ? "mistral-small-latest" : "deepseek-chat";
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` };
      if (providerId === "deepseek") headers["Authorization"] = `Bearer ${apiKey}`;

      const res = await fetch(provider.testEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Salam. Qısa cavab ver." }],
          max_tokens: 50,
          temperature: 0.1,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.choices?.[0]) {
        const responseText = data.choices[0].message?.content || "";
        return Response.json({ success: true, message: `${provider.name} işləyir!`, sample: responseText.slice(0, 100) });
      }
      return Response.json({ success: false, message: `API xətası: ${data?.error?.message || "Bilinməyən xəta"}` });
    }

    if (providerId === "anthropic") {
      const res = await fetch(provider.testEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 50,
          messages: [{ role: "user", content: "Salam. Qısa cavab ver." }],
        }),
      });
      const data = await res.json();
      if (res.ok && data?.content?.[0]) {
        const responseText = data.content[0].text || "";
        return Response.json({ success: true, message: `${provider.name} işləyir!`, sample: responseText.slice(0, 100) });
      }
      return Response.json({ success: false, message: `API xətası: ${data?.error?.message || "Bilinməyən xəta"}` });
    }

    return Response.json({ success: false, message: "Bu provayder üçün test dəstəklənmir" });
  } catch (error) {
    return Response.json({ success: false, message: `Bağlantı xətası: ${error.message}` });
  }
}

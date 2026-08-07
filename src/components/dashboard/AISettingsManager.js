"use client";
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/Toast";

const PROVIDER_COLORS = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", badge: "bg-blue-50 text-blue-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-50 text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", badge: "bg-amber-50 text-amber-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", badge: "bg-violet-50 text-violet-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", badge: "bg-indigo-50 text-indigo-600" },
};

export default function AISettingsManager() {
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // provider id being saved
  const [testing, setTesting] = useState(null); // provider id being tested
  const [data, setData] = useState(null);
  const [keyInputs, setKeyInputs] = useState({}); // { providerKey: "newKeyValue" }
  const [showKeys, setShowKeys] = useState({}); // { providerKey: true/false }
  const [testResults, setTestResults] = useState({}); // { providerId: result }
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModule, setNewModule] = useState({ id: "", name: "", description: "", endpoint: "", icon: "bot" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/ai-settings");
      setData(res);
    } catch (err) {
      showToast("AI ayarları yüklənmədi", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleSaveKey = async (provider) => {
    const inputValue = keyInputs[provider.keySettingKey] || "";
    if (!inputValue.trim()) {
      showToast("Zəhmət olmasa API açarı daxil edin", "warning");
      return;
    }
    setSaving(provider.id);
    try {
      const res = await apiFetch("/api/admin/ai-settings", {
        method: "PUT",
        body: JSON.stringify({ providerKey: provider.keySettingKey, apiKey: inputValue.trim() }),
      });
      if (res.success) {
        showToast(res.message, "success");
        setKeyInputs(prev => ({ ...prev, [provider.keySettingKey]: "" }));
        setShowKeys(prev => ({ ...prev, [provider.keySettingKey]: false }));
        setTestResults(prev => ({ ...prev, [provider.id]: null }));
        load();
      } else showToast(res.error || "Xəta", "error");
    } catch {
      showToast("Yeniləmə uğursuz", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteKey = async (provider) => {
    setSaving(provider.id);
    try {
      const res = await apiFetch("/api/admin/ai-settings", {
        method: "PUT",
        body: JSON.stringify({ providerKey: provider.keySettingKey, apiKey: "" }),
      });
      if (res.success) {
        showToast(res.message, "success");
        setTestResults(prev => ({ ...prev, [provider.id]: null }));
        load();
      }
    } catch {
      showToast("Silinmə uğursuz", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleTest = async (provider) => {
    setTesting(provider.id);
    setTestResults(prev => ({ ...prev, [provider.id]: null }));
    try {
      const res = await apiFetch("/api/admin/ai-settings", {
        method: "POST",
        body: JSON.stringify({ providerId: provider.id }),
      });
      setTestResults(prev => ({ ...prev, [provider.id]: res }));
      showToast(res.success ? `${provider.name} işləyir!` : (res.message || "Test uğursuz"), res.success ? "success" : "error");
    } catch {
      setTestResults(prev => ({ ...prev, [provider.id]: { success: false, message: "Bağlantı xətası" } }));
      showToast("Test uğursuz", "error");
    } finally {
      setTesting(null);
    }
  };

  const handleToggleModule = async (modId, currentActive) => {
    try {
      const res = await apiFetch("/api/admin/ai-settings", {
        method: "PUT",
        body: JSON.stringify({ moduleId: modId, moduleActive: !currentActive }),
      });
      if (res.success) {
        showToast(res.message, "success");
        load();
      }
    } catch {
      showToast("Əməliyyat uğursuz", "error");
    }
  };

  const handleAddModule = async () => {
    if (!newModule.id.trim() || !newModule.name.trim()) {
      showToast("Modul ID və adı tələb olunur", "warning");
      return;
    }
    setSaving("module");
    try {
      const res = await apiFetch("/api/admin/ai-settings", {
        method: "PUT",
        body: JSON.stringify({ newModule: { ...newModule, id: newModule.id.trim().toLowerCase().replace(/\s+/g, "-") } }),
      });
      if (res.success) {
        showToast(res.message, "success");
        setShowAddModule(false);
        setNewModule({ id: "", name: "", description: "", endpoint: "", icon: "bot" });
        load();
      }
    } catch {
      showToast("Əlavə uğursuz", "error");
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteModule = async (modId) => {
    if (!confirm("Bu modulu silmək istədiyinizə əminsiniz?")) return;
    try {
      const res = await apiFetch("/api/admin/ai-settings", {
        method: "PUT",
        body: JSON.stringify({ deleteModuleId: modId }),
      });
      if (res.success) { showToast(res.message, "success"); load(); }
    } catch {
      showToast("Silinmə uğursuz", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const keySourceLabels = {
    database: { label: "DB-də", color: "bg-emerald-50 text-emerald-600" },
    env: { label: "ENV", color: "bg-blue-50 text-blue-600" },
    none: { label: "Yoxdur", color: "bg-red-50 text-red-600" },
  };

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="bot" size={24} className="text-brand-600" />
            AI Modulları
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            AI provayderlərinin API açarlarını idarə edin, modulları aktiv/deaktiv edin
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${data?.hasActiveKey ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
          {data?.hasActiveKey ? "● AI Aktiv" : "● AI Deaktiv"}
        </span>
      </div>

      {/* API Key Cards — one per provider */}
      <div className="space-y-4">
        {(data?.providers || []).map((provider) => {
          const colors = PROVIDER_COLORS[provider.color] || PROVIDER_COLORS.blue;
          return (
            <div key={provider.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <Icon name={provider.icon} size={20} className={colors.text} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    {provider.name}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${provider.hasKey ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                      {provider.hasKey ? "● Açar var" : "○ Açar yoxdur"}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Modellər: {provider.models.join(", ")}
                  </p>
                </div>
                {provider.hasKey && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${keySourceLabels[provider.keySource]?.color}`}>
                    {keySourceLabels[provider.keySource]?.label}
                  </span>
                )}
              </div>

              {/* Current key display */}
              {provider.hasKey && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">DB açarı</p>
                    <p className="font-mono text-xs text-gray-700">{provider.dbKey || "—"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">ENV açarı</p>
                    <p className="font-mono text-xs text-gray-700">{provider.envKey || "—"}</p>
                  </div>
                </div>
              )}

              {/* New key input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Yeni API açarı daxil edin</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys[provider.keySettingKey] ? "text" : "password"}
                      value={keyInputs[provider.keySettingKey] || ""}
                      onChange={(e) => setKeyInputs(prev => ({ ...prev, [provider.keySettingKey]: e.target.value }))}
                      placeholder={provider.placeholder}
                      className="w-full px-3 py-2 pr-9 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, [provider.keySettingKey]: !prev[provider.keySettingKey] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon name="eye" size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveKey(provider)}
                    disabled={saving === provider.id || !(keyInputs[provider.keySettingKey] || "").trim()}
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {saving === provider.id ? <Icon name="loader" size={14} className="animate-spin" /> : <Icon name="save" size={14} />}
                    Saxla
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  💡 <a href={provider.helpUrl} target="_blank" rel="noopener" className="text-brand-600 hover:underline">{provider.helpText}</a>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleTest(provider)}
                  disabled={testing === provider.id || !provider.hasKey}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {testing === provider.id ? <Icon name="loader" size={14} className="animate-spin" /> : <Icon name="zap" size={14} />}
                  Test Et
                </button>
                {provider.hasKey && (
                  <button
                    onClick={() => handleDeleteKey(provider)}
                    disabled={saving === provider.id}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Icon name="trash" size={14} />
                    Açarı Sil
                  </button>
                )}
              </div>

              {/* Test result */}
              {testResults[provider.id] && (
                <div className={`mt-2 p-2.5 rounded-lg text-xs ${testResults[provider.id].success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  <p className="font-semibold flex items-center gap-1.5">
                    <Icon name={testResults[provider.id].success ? "checkCircle" : "closeCircle"} size={14} />
                    {testResults[provider.id].message}
                  </p>
                  {testResults[provider.id].sample && (
                    <p className="mt-1 text-xs opacity-70">Nümunə: {testResults[provider.id].sample}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Modules */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Icon name="sparkles" size={18} className="text-brand-600" />
            AI Modulları
          </h3>
          <button
            onClick={() => setShowAddModule(!showAddModule)}
            className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 text-sm font-semibold hover:bg-brand-100 flex items-center gap-1.5"
          >
            <Icon name="plus" size={16} /> Yeni Modul
          </button>
        </div>

        {showAddModule && (
          <div className="mb-4 p-4 rounded-xl border border-brand-200 bg-brand-50/30">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Yeni AI Modulu Əlavə Et</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={newModule.id} onChange={e => setNewModule({...newModule, id: e.target.value})} placeholder="Modul ID" className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              <input value={newModule.name} onChange={e => setNewModule({...newModule, name: e.target.value})} placeholder="Modul adı" className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              <input value={newModule.endpoint} onChange={e => setNewModule({...newModule, endpoint: e.target.value})} placeholder="API endpoint" className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              <select value={newModule.icon} onChange={e => setNewModule({...newModule, icon: e.target.value})} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="bot">Robot</option>
                <option value="sparkles">Sparkles</option>
                <option value="trendingUp">Trending</option>
                <option value="sprout">Sprout</option>
                <option value="zap">Zap</option>
                <option value="settings">Settings</option>
              </select>
            </div>
            <textarea value={newModule.description} onChange={e => setNewModule({...newModule, description: e.target.value})} placeholder="Təsvir..." className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" rows={2} />
            <div className="flex gap-2 mt-3">
              <button onClick={handleAddModule} disabled={saving === "module"} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2">
                {saving === "module" ? <Icon name="loader" size={14} className="animate-spin" /> : <Icon name="check" size={14} />} Əlavə Et
              </button>
              <button onClick={() => setShowAddModule(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200">İmtina</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.modules || []).map((mod) => (
            <div key={mod.id} className={`border rounded-xl p-4 transition-all ${mod.active ? "border-brand-200 bg-white" : "border-gray-200 bg-gray-50 opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.active ? "bg-brand-50" : "bg-gray-100"}`}>
                  <Icon name={mod.icon || "bot"} size={20} className={mod.active ? "text-brand-600" : "text-gray-400"} />
                </div>
                <button onClick={() => handleToggleModule(mod.id, mod.active)} className={`relative w-11 h-6 rounded-full transition-colors ${mod.active ? "bg-brand-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${mod.active ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{mod.name}</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{mod.description}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mod.active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                  {mod.active ? "● Aktiv" : "○ Deaktiv"}
                </span>
                <div className="flex items-center gap-2">
                  {mod.page && mod.active && <a href={mod.page} className="text-xs text-brand-600 hover:underline">Səhifə →</a>}
                  {mod.isCustom && <button onClick={() => handleDeleteModule(mod.id)} className="text-xs text-red-500 hover:text-red-700"><Icon name="trash" size={14} /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

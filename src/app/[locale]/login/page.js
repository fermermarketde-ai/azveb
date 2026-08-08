"use client";
import { useState, Suspense } from "react";
import { useRouter, Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import { apiFetch, saveSession } from "@/lib/apiClient";
import PasswordInput from "@/components/PasswordInput";
import Icon from "@/components/ui/Icon";
import { useSiteTexts } from "@/lib/siteTexts";

function LoginContent() {
  const router = useRouter();
  const locale = useLocale();
  const { t } = useSiteTexts();
  const [form, setForm] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
      
      const callbackUrl = searchParams.get("callbackUrl");
      let target = callbackUrl || "/dashboard";
      target = target.replace(/^\/(az|en|ru)(\/|$)/, "/");
      
      window.location.href = target;
    } catch (err) {
      const msg = err?.code === "DB_CONN"
        ? t('login.error_db', 'Sunucu bağlantısı hatası. Lütfen yöneticinizle iletişime geçin.')
        : err.message || t('login.error_generic', 'Giriş mümkün olmadı');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 pb-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="sprout" size={30} className="text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">{t('login.title', 'FermerMarket')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('login.subtitle', 'Kabinetinizə daxil olun')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
              <Icon name="alert" size={16} className="shrink-0" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('login.label_login', 'Giriş (E-poçt, telefon və ya istifadəçi adı)')}</label>
              <input
                type="text" required
                className="input-field mt-1"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                placeholder={t('login.placeholder_login', 'Nümunə: 0501234567, email, və s.')}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-gray-700">{t('login.label_password', 'Şifrə')}</label>
                <a href="/forgot-password" className="text-xs text-brand-600 hover:underline font-medium text-green-600">{t('login.forgot', 'Şifrəni unutdum?')}</a>
              </div>

              <PasswordInput
                id="password"
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="input-field mt-1"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? t('common.loading', 'Yüklənir...') : t('login.button', 'Daxil ol')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            {t('login.register_text', 'Hesabınız yoxdur?')}{" "}
            <Link href="/register" className="text-green-600 font-semibold hover:underline">{t('login.register_link', 'Qeydiyyat')}</Link>
          </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  const { t } = useSiteTexts();
  return <div className="w-full max-w-sm p-8 text-center text-gray-400">{t('common.loading', 'Yüklənir...')}</div>;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}

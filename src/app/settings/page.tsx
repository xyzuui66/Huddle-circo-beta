"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useSettingsStore } from "@/contexts/settings-store";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  Trash2,
  HelpCircle,
  Info,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "fluxtecheng@gmail.com";

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage, notifications, setNotifications, clearCache } =
    useSettingsStore();
  const { setTheme: applyTheme } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();

  function handleThemeChange(t: "light" | "dark" | "system") {
    setTheme(t);
    applyTheme(t);
  }

  function handleClearCache() {
    clearCache();
    toast.success("Cache berhasil dihapus!");
  }

  function handleHelp() {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Bantuan Huddle`;
  }

  async function handleLogout() {
    await signOut();
    router.replace("/auth/login");
    toast.success("Berhasil keluar!");
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pengaturan
        </h1>

        {/* TEMA */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Tampilan
          </h2>
          <div>
            <p className="text-gray-800 dark:text-gray-200 font-medium mb-3">
              Tema
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light", label: "Terang", icon: Sun },
                { value: "dark", label: "Gelap", icon: Moon },
                { value: "system", label: "Sistem", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value as "light" | "dark" | "system")}
                  className={clsx(
                    "flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all",
                    theme === t.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                  )}
                >
                  <t.icon size={20} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BAHASA */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Bahasa
          </h2>
          <div className="space-y-2">
            {[
              { value: "id", label: "Bahasa Indonesia" },
              { value: "en", label: "English" },
              { value: "system", label: "Ikuti Bahasa Sistem" },
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value as "id" | "en" | "system")}
                className={clsx(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                  language === lang.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-gray-500" />
                  <span className="text-gray-800 dark:text-gray-200 text-sm">
                    {lang.label}
                  </span>
                </div>
                {language === lang.value && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* NOTIFIKASI */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Notifikasi
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-500" />
              <div>
                <p className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                  Notifikasi Push
                </p>
                <p className="text-gray-400 text-xs">
                  Aktifkan notifikasi aplikasi
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={clsx(
                "relative w-12 h-6 rounded-full transition-all duration-300",
                notifications ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <div
                className={clsx(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300",
                  notifications ? "left-7" : "left-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* LAINNYA */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Lainnya
          </h2>
          <div className="space-y-1">
            {/* Clear Cache */}
            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={20} className="text-orange-500" />
                <div className="text-left">
                  <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                    Hapus Cache
                  </p>
                  <p className="text-gray-400 text-xs">Bersihkan data cache aplikasi</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            {/* Help */}
            <button
              onClick={handleHelp}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={20} className="text-blue-500" />
                <div className="text-left">
                  <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                    Bantuan
                  </p>
                  <p className="text-gray-400 text-xs">{SUPPORT_EMAIL}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            {/* Privacy */}
            <div className="flex items-center justify-between px-3 py-3 rounded-xl">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-green-500" />
                <div className="text-left">
                  <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                    Privasi
                  </p>
                  <p className="text-gray-400 text-xs">
                    Kami tidak mengambil data sensitif apapun
                  </p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="flex items-center justify-between px-3 py-3 rounded-xl">
              <div className="flex items-center gap-3">
                <Info size={20} className="text-purple-500" />
                <div className="text-left">
                  <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                    Tentang Huddle
                  </p>
                  <p className="text-gray-400 text-xs">Versi {APP_VERSION}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
        >
          <LogOut size={18} />
          Keluar
        </button>

        <p className="text-center text-xs text-gray-300 dark:text-gray-600 pb-4">
          Huddle v{APP_VERSION} - Open Source MIT License
        </p>
      </div>
    </MainLayout>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "next-themes";
import { useSettingsStore } from "@/contexts/settings-store";
import {
  Home,
  MessageCircle,
  Globe,
  Users,
  BookOpen,
  Radio,
  Rss,
  Settings,
  User,
  Phone,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/global-chat", icon: Globe, label: "Chat Global" },
  { href: "/chat", icon: MessageCircle, label: "Pesan" },
  { href: "/calls", icon: Phone, label: "Panggilan" },
  { href: "/groups", icon: Users, label: "Grup" },
  { href: "/communities", icon: Home, label: "Komunitas" },
  { href: "/stories", icon: BookOpen, label: "Cerita" },
  { href: "/feeds", icon: Rss, label: "Berita" },
  { href: "/channels", icon: Radio, label: "Saluran" },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { theme } = useSettingsStore();

  useEffect(() => {
    setTheme(theme === "system" ? "system" : theme);
  }, [theme, setTheme]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Image src="/icons/logo.png" alt="Huddle" width={64} height={64} className="rounded-2xl animate-pulse" />
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <Image src="/icons/logo.png" alt="Huddle" width={36} height={36} className="rounded-xl" />
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Huddle</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx("sidebar-item", {
                active: pathname.startsWith(item.href),
              })}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 dark:border-gray-700 p-3 space-y-1">
          <Link
            href="/settings"
            className={clsx("sidebar-item", {
              active: pathname === "/settings",
            })}
          >
            <Settings size={20} />
            <span className="text-sm font-medium">Pengaturan</span>
          </Link>
          <Link
            href="/profile"
            className={clsx("sidebar-item", {
              active: pathname === "/profile",
            })}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {profile?.username?.[0]?.toUpperCase() || <User size={12} />}
            </div>
            <span className="text-sm font-medium truncate">
              {profile?.username || "Profil"}
            </span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>

        {/* BOTTOM NAV MOBILE */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-50">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
                  pathname.startsWith(item.href)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                )}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
            <Link
              href="/settings"
              className={clsx(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
                pathname === "/settings"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              <Settings size={22} />
              <span className="text-[10px] font-medium">Setelan</span>
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}

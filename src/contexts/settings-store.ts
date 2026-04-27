"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language, Theme } from "@/types";

interface SettingsState {
  theme: Theme;
  language: Language;
  notifications: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setNotifications: (enabled: boolean) => void;
  clearCache: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "light",
      language: "system",
      notifications: true,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) => set({ notifications }),
      clearCache: () => {
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
          if ("caches" in window) {
            caches.keys().then((keys) => {
              keys.forEach((key) => caches.delete(key));
            });
          }
        }
      },
    }),
    {
      name: "huddle-settings",
    }
  )
);

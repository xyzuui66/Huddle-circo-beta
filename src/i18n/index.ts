"use client";

import { useSettingsStore } from "@/contexts/settings-store";
import id from "./locales/id.json";
import en from "./locales/en.json";

const locales = { id, en };

type DeepKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = DeepKeyOf<typeof id>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split(".").reduce((current: unknown, key: string) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return path;
  }, obj) as string;
}

function getSystemLanguage(): "id" | "en" {
  if (typeof window === "undefined") return "id";
  const systemLang = navigator?.language?.split("-")[0];
  return systemLang === "en" ? "en" : "id";
}

export function useTranslation() {
  const { language } = useSettingsStore();

  let lang: "id" | "en" = "id";

  if (language === "system") {
    lang = getSystemLanguage();
  } else if (language === "en" || language === "id") {
    lang = language as "id" | "en";
  }

  const translations = locales[lang] || locales.id;

  function t(key: TranslationKey | string): string {
    return getNestedValue(translations as Record<string, unknown>, key) || key;
  }

  return { t, lang };
}

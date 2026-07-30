import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { EN, FR, LN, type Locale } from "./translations";

type Translations = Record<Locale, Record<string, string>>;

const DICTIONARIES: Translations = {
  fr: FR,
  en: EN,
  ln: LN,
};

const I18nContext = createContext({
  locale: "fr" as Locale,
  t: (key: string) => key,
  setLocale: (_locale: Locale) => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "fr";
    }

    const storedLocale = window.localStorage.getItem("app-locale");
    return storedLocale === "en" || storedLocale === "ln" ? (storedLocale as Locale) : "fr";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app-locale", locale);
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string) => DICTIONARIES[locale][key] || DICTIONARIES.fr[key] || key,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

export type { Locale };

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { FR, type Locale } from "./translations";

type Translations = Record<Locale, Record<string, string>>;

const DICTIONARIES: Translations = {
  fr: FR,
  en: FR,
  ln: FR,
  es: FR,
  sw: FR,
  pt: FR,
  zh: FR,
};

const I18nContext = createContext({
  locale: "fr" as Locale,
  t: (key: string) => key,
  setLocale: (_locale: Locale) => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string) => DICTIONARIES[locale][key] || key,
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

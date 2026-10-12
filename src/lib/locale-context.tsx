"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  type Locale,
  type TranslationKey,
  DEFAULT_LOCALE,
  localeFromPath,
  isRtl,
  t as translate,
} from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  dir: "rtl",
  t: (key) => translate(key, DEFAULT_LOCALE),
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const dir = isRtl(locale) ? "rtl" : "ltr";

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir,
      t: (key: TranslationKey) => translate(key, locale),
    }),
    [locale, dir],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

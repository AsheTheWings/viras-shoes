"use client";

import { Globe, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { LOCALES, LOCALE_LABELS, pathForLocale, type Locale } from "@/lib/i18n";
import { rememberLocale } from "@/lib/locale-cookie";

export function LanguageSwitcher() {
  const { locale } = useLocale();
  const router = useRouter();
  function switchLocale(target: Locale) {
    if (target === locale) return;
    void rememberLocale(target);
    router.push(pathForLocale(target));
  }
  return (
    <label className="language-switcher">
      <Globe size={15} />
      <select
        value={locale}
        aria-label="Language / اللغة / Langue"
        onChange={(event) => switchLocale(event.target.value as Locale)}
      >
        {LOCALES.map((value) => (
          <option key={value} value={value}>
            {LOCALE_LABELS[value]}
          </option>
        ))}
      </select>
      <ChevronDown size={12} aria-hidden="true" />
    </label>
  );
}

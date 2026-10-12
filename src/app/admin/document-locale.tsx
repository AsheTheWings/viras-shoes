"use client";

import { useEffect } from "react";
import { isRtl, type Locale } from "@/lib/i18n";

/** Applies the admin's chosen language to the document element. */
export function DocumentLocale({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
  }, [locale]);
  return null;
}

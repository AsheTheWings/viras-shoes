"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/locale-context";

/** Syncs <html> lang and dir attributes with current locale */
export function HtmlLangSync() {
  const { locale, dir } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale === "ar" ? "ar" : locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";

/**
 * Syncs <html> lang and dir with the shop locale after client navigation.
 * The admin area takes its language from a cookie and sets these itself.
 */
export function HtmlLangSync() {
  const { locale, dir } = useLocale();
  const admin = usePathname().startsWith("/admin");

  useEffect(() => {
    if (admin) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [admin, locale, dir]);

  return null;
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { LOCALES, LOCALE_LABELS, pathForLocale, type Locale } from "@/lib/i18n";
import { rememberLocale } from "@/lib/locale-cookie";

export function LanguageSwitcher() {
  const { locale } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const switchLocale = (target: Locale) => {
    setOpen(false);
    if (target === locale) return;
    void rememberLocale(target);
    router.push(pathForLocale(target));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium text-white/80 transition-colors hover:text-white"
      >
        <Globe className="h-3.5 w-3.5" />
        {LOCALE_LABELS[locale]}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-1 min-w-[4.5rem] overflow-hidden rounded-md border border-white/10 bg-black/95 py-0.5 shadow-xl backdrop-blur-sm">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                l === locale
                  ? "bg-white/10 font-semibold text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

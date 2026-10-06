"use client";

import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { rememberLocale } from "@/lib/locale-cookie";

export function AdminLocaleSwitcher({
  locale,
  tone,
}: {
  locale: Locale;
  tone: "dark" | "light";
}) {
  const router = useRouter();

  async function pick(target: Locale) {
    if (target === locale) return;
    await rememberLocale(target);
    router.refresh();
  }

  const active =
    tone === "dark"
      ? "bg-white/15 font-semibold text-white"
      : "bg-neutral-900 font-semibold text-white";
  const idle =
    tone === "dark"
      ? "text-white/60 hover:bg-white/10 hover:text-white"
      : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900";

  return (
    <div
      className={
        tone === "dark"
          ? "flex items-center gap-0.5 rounded-full border border-white/15 p-0.5"
          : "flex items-center gap-0.5 rounded-full border border-neutral-300 bg-white p-0.5"
      }
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => void pick(l)}
          className={`rounded-full px-2 py-0.5 text-[11px] transition-colors ${l === locale ? active : idle}`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

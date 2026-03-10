"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  const { locale, dir, t } = useLocale();

  return (
    <div
      className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center bg-black px-4 text-center"
      dir={dir}
    >
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white/5">
        <AlertCircle className="h-16 w-16 text-white/60" />
      </div>

      <h1 className="mb-4 font-[family-name:var(--font-geist)] text-[10rem] font-bold leading-none tracking-tight text-white sm:text-[12rem]">
        404
      </h1>

      <h2 className="mb-6 text-3xl font-medium text-white/90 sm:text-4xl">
        {t("notfound.title")}
      </h2>

      <p className="mb-10 max-w-lg text-lg text-white/60 sm:text-xl">
        {t("notfound.description")}
      </p>

      <Link
        href={locale === "ar" ? "/" : `/${locale}`}
        className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
        dir="ltr"
      >
        <Home className="h-4 w-4" />
        <span>{t("notfound.back")}</span>
      </Link>
    </div>
  );
}

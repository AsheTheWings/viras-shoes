import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ADMIN_COOKIE, getAdminCode, verifySession } from "@/lib/admin-auth";
import { DEFAULT_LOCALE, LOCALES, isRtl, t, type Locale } from "@/lib/i18n";
import { listShoeImagesByItem, readSiteSettings, serviceDb } from "@/lib/shoe-images";
import type { Shoe, ShoeSize } from "@/lib/types";
import { AdminLocaleSwitcher } from "./admin-locale-switcher";
import { AdminLoginForm } from "./login-form";
import { AdminDashboard, type AdminOrder } from "./dashboard";
import { DocumentLocale } from "./document-locale";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = {
  title: "Admin · Viras Shoes",
  robots: { index: false, follow: false },
};

function resolveLocale(raw: string | undefined): Locale {
  return (LOCALES as readonly string[]).includes(raw ?? "")
    ? (raw as Locale)
    : DEFAULT_LOCALE;
}

function shell(content: React.ReactNode, locale: Locale) {
  return (
    <main
      dir={isRtl(locale) ? "rtl" : "ltr"}
      // `relative` keeps absolutely positioned descendants inside this
      // scroll container instead of stretching the document.
      className="relative h-dvh overflow-y-auto bg-neutral-100 text-neutral-900"
    >
      <DocumentLocale locale={locale} />
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="text-sm font-bold tracking-[0.3em]">VIRAS</span>
            <span className="truncate text-sm text-neutral-500">{t("admin.title", locale)}</span>
          </div>
          <div className="flex items-center gap-2">
            <AdminLocaleSwitcher locale={locale} tone="light" />
            <LogoutButton locale={locale} />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">{content}</div>
    </main>
  );
}

export default async function AdminPage() {
  const jar = await cookies();
  const signedIn = verifySession(jar.get(ADMIN_COOKIE)?.value);
  const locale = resolveLocale(jar.get("viras_locale")?.value);

  if (!signedIn) {
    return (
      <main className="min-h-dvh bg-neutral-950">
        <DocumentLocale locale={locale} />
        <AdminLoginForm configured={!!getAdminCode()} locale={locale} />
      </main>
    );
  }

  let db;
  try {
    db = serviceDb();
  } catch {
    return shell(
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-6">
        <h1 className="text-lg font-semibold">{t("admin.notconfigured.title", locale)}</h1>
        <p className="mt-2 text-sm text-neutral-600">{t("admin.notconfigured.hint", locale)}</p>
      </div>,
      locale,
    );
  }

  const [{ data: ordersData }, { data: shoesData }, { data: sizesData }, imagesByItem, settings] =
    await Promise.all([
      db.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
      db.from("shoes").select("*").order("item_number", { ascending: true }),
      db
        .from("shoe_sizes")
        .select("*")
        .order("shoe_id", { ascending: true })
        .order("size", { ascending: true }),
      listShoeImagesByItem(),
      readSiteSettings(db),
    ]);

  return shell(
    <AdminDashboard
      orders={(ordersData ?? []) as AdminOrder[]}
      shoes={(shoesData ?? []) as Shoe[]}
      sizes={(sizesData ?? []) as ShoeSize[]}
      imagesByItem={imagesByItem}
      social={settings.social}
      locale={locale}
    />,
    locale,
  );
}

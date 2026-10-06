import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { ADMIN_COOKIE, getAdminCode, verifySession } from "@/lib/admin-auth";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n";
import type { Shoe, ShoeSize } from "@/lib/types";
import { AdminLoginForm } from "./login-form";
import { AdminDashboard, type AdminOrder } from "./dashboard";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = {
  title: "Admin · Viras Shoes",
  robots: { index: false, follow: false },
};

function shell(content: React.ReactNode) {
  return (
    <main className="h-dvh overflow-y-auto bg-neutral-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Viras Shoes · Admin
        </p>
        <div className="mt-4">{content}</div>
      </div>
    </main>
  );
}

export default async function AdminPage() {
  const jar = await cookies();
  const signedIn = verifySession(jar.get(ADMIN_COOKIE)?.value);

  if (!signedIn) {
    const rawLocale = jar.get("viras_locale")?.value;
    const locale: Locale = (LOCALES as readonly string[]).includes(rawLocale ?? "")
      ? (rawLocale as Locale)
      : DEFAULT_LOCALE;
    return (
      <main className="min-h-dvh bg-neutral-950">
        <AdminLoginForm configured={!!getAdminCode()} locale={locale} />
      </main>
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return shell(
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">Admin database is not configured</h1>
          <LogoutButton />
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Set SUPABASE_SERVICE_ROLE_KEY for this server, then reload this page.
        </p>
      </div>,
    );
  }

  const db = createClient(url, key);
  const [{ data: ordersData }, { data: shoesData }, { data: sizesData }] = await Promise.all([
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
    db.from("shoes").select("*").order("item_number", { ascending: true }),
    db.from("shoe_sizes").select("*").order("shoe_id", { ascending: true }).order("size", {
      ascending: true,
    }),
  ]);

  return shell(
    <AdminDashboard
      orders={(ordersData ?? []) as AdminOrder[]}
      shoes={(shoesData ?? []) as Shoe[]}
      sizes={(sizesData ?? []) as ShoeSize[]}
    />,
  );
}

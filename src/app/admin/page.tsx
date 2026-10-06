import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, getAdminCode, verifySession } from "@/lib/admin-auth";
import type { Shoe, ShoeSize } from "@/lib/types";
import { AdminLoginForm } from "./login-form";
import { AdminDashboard, type AdminOrder } from "./dashboard";
import { LogoutButton } from "./logout-button";

function shell(content: React.ReactNode) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Viras Shoes · Admin
      </p>
      <div className="mt-4">{content}</div>
    </main>
  );
}

export default async function AdminPage() {
  const jar = await cookies();
  const signedIn = verifySession(jar.get(ADMIN_COOKIE)?.value);

  if (!signedIn) {
    return shell(
      <div className="mx-auto max-w-sm rounded-lg border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">Enter the admin code to continue.</p>
        <div className="mt-4">
          <AdminLoginForm configured={!!getAdminCode()} />
        </div>
      </div>,
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

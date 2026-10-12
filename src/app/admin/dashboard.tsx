"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GalleryImage, Shoe, ShoeSize } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import { AdminLocaleSwitcher } from "./admin-locale-switcher";
import { LogoutButton } from "./logout-button";
import { OrdersSection } from "./orders-section";
import { ShoesSection } from "./shoes-section";

// Orders table shape. `select=*` keeps working if columns are added later.
export interface AdminOrder {
  id: string;
  created_at: string;
  shoe_id: number | null;
  size: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  status: string | null;
}

interface DashboardProps {
  orders: AdminOrder[];
  shoes: Shoe[];
  sizes: ShoeSize[];
  imagesByItem: Record<number, GalleryImage[]>;
  locale: Locale;
}

export function AdminDashboard({
  orders,
  shoes,
  sizes,
  imagesByItem,
  locale,
}: DashboardProps) {
  const [tab, setTab] = useState<"orders" | "shoes">("orders");
  const shoeNameById = Object.fromEntries(shoes.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={tab === "orders" ? "default" : "outline"}
            onClick={() => setTab("orders")}
          >
            {t("admin.tabs.orders", locale)}{" "}
            <Badge variant="secondary" className="ms-1">
              {orders.length}
            </Badge>
          </Button>
          <Button
            variant={tab === "shoes" ? "default" : "outline"}
            onClick={() => setTab("shoes")}
          >
            {t("admin.tabs.shoes", locale)}{" "}
            <Badge variant="secondary" className="ms-1">
              {shoes.length}
            </Badge>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <AdminLocaleSwitcher locale={locale} tone="light" />
          <LogoutButton locale={locale} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t("admin.tabs.orders", locale), orders.length],
          [t("admin.tabs.shoes", locale), shoes.length],
          [
            t("admin.units", locale),
            sizes.reduce((total, row) => total + Math.max(0, row.stock), 0),
          ],
          [
            t("admin.lowStock", locale),
            sizes.filter((row) => row.stock > 0 && row.stock <= 2).length,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-neutral-200 bg-white p-5"
          >
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-2 font-[family-name:var(--font-geist)] text-3xl font-medium">
              {value}
            </p>
          </div>
        ))}
      </div>
      {tab === "orders" ? (
        <OrdersSection
          orders={orders}
          shoeNameById={shoeNameById}
          locale={locale}
        />
      ) : (
        <ShoesSection
          shoes={shoes}
          sizes={sizes}
          imagesByItem={imagesByItem}
          locale={locale}
        />
      )}
    </div>
  );
}

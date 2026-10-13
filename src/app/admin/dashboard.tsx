"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Footprints,
  Share2,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import type { GalleryImage, Shoe, ShoeSize } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import { OrdersSection } from "./orders-section";
import { ShoesSection } from "./shoes-section";
import { SettingsSection } from "./settings-section";

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
  settings: SiteSettings;
  locale: Locale;
}

type Tab = "orders" | "shoes" | "social";

export function AdminDashboard({
  orders,
  shoes,
  sizes,
  imagesByItem,
  settings,
  locale,
}: DashboardProps) {
  const [tab, setTab] = useState<Tab>("orders");
  const shoeNameById = Object.fromEntries(shoes.map((s) => [s.id, s.name]));
  const tabs: { id: Tab; label: string; icon: LucideIcon; count?: number }[] = [
    { id: "orders", label: t("admin.tabs.orders", locale), icon: ShoppingBag, count: orders.length },
    { id: "shoes", label: t("admin.tabs.shoes", locale), icon: Footprints, count: shoes.length },
    { id: "social", label: t("admin.tabs.social", locale), icon: Share2 },
  ];
  const stats: { label: string; value: number; icon: LucideIcon; warn?: boolean }[] = [
    { label: t("admin.tabs.orders", locale), value: orders.length, icon: ShoppingBag },
    { label: t("admin.tabs.shoes", locale), value: shoes.length, icon: Footprints },
    {
      label: t("admin.units", locale),
      value: sizes.reduce((total, row) => total + Math.max(0, row.stock), 0),
      icon: Boxes,
    },
    {
      label: t("admin.lowStock", locale),
      value: sizes.filter((row) => row.stock > 0 && row.stock <= 2).length,
      icon: AlertTriangle,
      warn: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, warn }) => (
          <div key={label} className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-neutral-500">{label}</p>
              <Icon
                className={`size-4 ${warn && value > 0 ? "text-amber-600" : "text-neutral-400"}`}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 font-[family-name:var(--font-geist)] text-2xl font-medium sm:text-3xl">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        role="tablist"
        aria-label={t("admin.title", locale)}
        className="flex w-full gap-1 overflow-x-auto rounded-xl border border-neutral-200 bg-white p-1 sm:w-fit"
      >
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={active}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
                active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
              {count !== undefined ? (
                <span
                  className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-neutral-100 text-neutral-500"}`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "orders" ? (
          <OrdersSection orders={orders} shoeNameById={shoeNameById} locale={locale} />
        ) : tab === "shoes" ? (
          <ShoesSection shoes={shoes} sizes={sizes} imagesByItem={imagesByItem} locale={locale} />
        ) : (
          <SettingsSection settings={settings} locale={locale} />
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Mail, Phone, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ORDER_STATUSES,
  isOrderStatus,
  orderStatusLabel,
} from "@/lib/admin-errors";
import { t, type Locale } from "@/lib/i18n";
import { deleteOrder, updateOrderStatus } from "./actions";
import type { AdminOrder } from "./dashboard";
import { useAdminAction } from "./use-admin-action";

const DATE_LOCALES: Record<Locale, string> = {
  ar: "ar-MA",
  en: "en-GB",
  fr: "fr-FR",
};

const STATUS_TONES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-800 ring-sky-200",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

const selectClass =
  "h-8 rounded-lg border border-neutral-200 bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

function formatDate(value: string, locale: Locale): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString(DATE_LOCALES[locale], {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function StatusBadge({ status, locale }: { status: string | null; locale: Locale }) {
  const tone = STATUS_TONES[status ?? ""] ?? "bg-neutral-100 text-neutral-700 ring-neutral-200";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {orderStatusLabel(status, locale)}
    </span>
  );
}

function OrderRow({
  order,
  shoeName,
  locale,
}: {
  order: AdminOrder;
  shoeName: string;
  locale: Locale;
}) {
  const { pending, error, run } = useAdminAction(locale);
  const [status, setStatus] = useState(order.status ?? "");
  const [confirming, setConfirming] = useState(false);
  const label = `${t("admin.orders.status", locale)} — ${order.customer_name ?? order.id}`;

  return (
    <li className="grid gap-3 p-4 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1.2fr)_19rem] md:items-center">
      <div className="flex items-center justify-between gap-2 md:block">
        <p className="text-xs text-neutral-500">{formatDate(order.created_at, locale)}</p>
        <div className="md:mt-1.5">
          <StatusBadge status={order.status} locale={locale} />
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{shoeName}</p>
        <p className="text-xs text-neutral-500">
          {t("admin.orders.size", locale)}: <span dir="ltr">{order.size ? `EU ${order.size}` : "—"}</span>
        </p>
      </div>
      <div className="min-w-0 space-y-0.5 text-sm">
        <p className="truncate font-medium">{order.customer_name ?? "—"}</p>
        {order.customer_phone ? (
          <a
            href={`tel:${order.customer_phone}`}
            className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900"
          >
            <Phone className="size-3" />
            <span dir="ltr">{order.customer_phone}</span>
          </a>
        ) : null}
        {order.customer_email ? (
          <a
            href={`mailto:${order.customer_email}`}
            className="flex items-center gap-1.5 truncate text-xs text-neutral-600 hover:text-neutral-900"
          >
            <Mail className="size-3" />
            <span className="truncate">{order.customer_email}</span>
          </a>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <select
          aria-label={label}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={pending}
          className={selectClass}
        >
          {!isOrderStatus(status) ? <option value={status}>{orderStatusLabel(status, locale)}</option> : null}
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabel(value, locale)}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          disabled={pending || status === (order.status ?? "")}
          onClick={() => run(() => updateOrderStatus(order.id, status))}
        >
          {t("admin.orders.save", locale)}
        </Button>
        {confirming ? (
          <span className="inline-flex gap-1.5">
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => run(() => deleteOrder(order.id), () => setConfirming(false))}
            >
              {t("admin.orders.confirm", locale)}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
              {t("admin.orders.keep", locale)}
            </Button>
          </span>
        ) : (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setConfirming(true)}
            aria-label={t("admin.orders.delete", locale)}
            title={t("admin.orders.delete", locale)}
          >
            <Trash2 />
          </Button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-600 md:col-span-4 md:text-end">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export function OrdersSection({
  orders,
  shoeNameById,
  locale,
}: {
  orders: AdminOrder[];
  shoeNameById: Record<number, string>;
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const statuses = Array.from(
    new Set([...ORDER_STATUSES, ...orders.map((order) => order.status ?? "").filter(Boolean)]),
  );
  const needle = query.trim().toLocaleLowerCase();
  const visible = orders.filter((order) => {
    const text = [
      order.customer_name,
      order.customer_phone,
      order.customer_email,
      order.id,
      order.shoe_id === null ? "" : shoeNameById[order.shoe_id],
    ]
      .join(" ")
      .toLocaleLowerCase();
    return text.includes(needle) && (!statusFilter || order.status === statusFilter);
  });
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
        {t("admin.orders.empty", locale)}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("admin.search", locale)}
            aria-label={t("admin.search", locale)}
            className="h-9 bg-white ps-8"
          />
        </div>
        <select
          className={`${selectClass} h-9`}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label={t("admin.orders.status", locale)}
        >
          <option value="">{t("admin.allStatuses", locale)}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabel(status, locale)}
            </option>
          ))}
        </select>
        <span className="ms-auto text-xs text-neutral-500" aria-live="polite">
          {visible.length} / {orders.length}
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="hidden grid-cols-[9rem_minmax(0,1fr)_minmax(0,1.2fr)_19rem] gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-500 md:grid">
          <span>{t("admin.orders.placed", locale)}</span>
          <span>{t("admin.orders.shoe", locale)}</span>
          <span>{t("admin.orders.customer", locale)}</span>
          <span className="text-end">{t("admin.orders.actions", locale)}</span>
        </div>
        {visible.length ? (
          <ul className="divide-y divide-neutral-200">
            {visible.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                shoeName={o.shoe_id != null ? (shoeNameById[o.shoe_id] ?? `#${o.shoe_id}`) : "—"}
                locale={locale}
              />
            ))}
          </ul>
        ) : (
          <p className="p-8 text-center text-sm text-neutral-500">{t("admin.noResults", locale)}</p>
        )}
      </div>
    </div>
  );
}

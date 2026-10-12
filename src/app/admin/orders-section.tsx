"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t, type Locale } from "@/lib/i18n";
import { deleteOrder, updateOrderStatus } from "./actions";
import type { AdminOrder } from "./dashboard";

const DATE_LOCALES: Record<Locale, string> = {
  ar: "ar",
  en: "en-GB",
  fr: "fr",
};

function formatDate(value: string, locale: Locale): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString(DATE_LOCALES[locale]);
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
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(order.status ?? "");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run(action: Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    start(async () => {
      let res: { ok: true } | { ok: false; error: string };
      try {
        res = await action;
      } catch {
        setError(t("admin.action.failed", locale));
        return;
      }
      if (res.ok) {
        setConfirming(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <tr className="border-t border-neutral-200">
      <td className="whitespace-nowrap px-3 py-2 text-xs text-neutral-500">
        {formatDate(order.created_at, locale)}
      </td>
      <td className="px-3 py-2 font-medium">{shoeName}</td>
      <td className="px-3 py-2">{order.size ?? "—"}</td>
      <td className="px-3 py-2">
        <div>{order.customer_name ?? "—"}</div>
        <div className="text-xs text-neutral-500" dir="ltr">
          {order.customer_phone ?? ""}
        </div>
        <div className="text-xs text-neutral-500">
          {order.customer_email ?? ""}
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <Input
            aria-label={`${t("admin.orders.status", locale)} — ${order.customer_name ?? order.id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={pending}
            className="h-8 w-32"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={pending || status.trim() === (order.status ?? "")}
            onClick={() => run(updateOrderStatus(order.id, status))}
          >
            {t("admin.orders.save", locale)}
          </Button>
        </div>
      </td>
      <td className="px-3 py-2 text-end">
        {confirming ? (
          <span className="inline-flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => run(deleteOrder(order.id))}
            >
              {t("admin.orders.confirm", locale)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirming(false)}
            >
              {t("admin.orders.keep", locale)}
            </Button>
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirming(true)}
          >
            {t("admin.orders.delete", locale)}
          </Button>
        )}
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </td>
    </tr>
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
    new Set(orders.map((order) => order.status ?? "").filter(Boolean)),
  ).sort();
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
    return (
      text.includes(query.trim().toLocaleLowerCase()) &&
      (!statusFilter || order.status === statusFilter)
    );
  });
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
        {t("admin.orders.empty", locale)}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("admin.search", locale)}
          aria-label={t("admin.search", locale)}
          className="max-w-sm bg-white"
        />
        <select
          className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label={t("admin.orders.status", locale)}
        >
          <option value="">{t("admin.allStatuses", locale)}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <span className="text-xs text-neutral-500" aria-live="polite">
          {visible.length} / {orders.length}
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2">{t("admin.orders.placed", locale)}</th>
              <th className="px-3 py-2">{t("admin.orders.shoe", locale)}</th>
              <th className="px-3 py-2">{t("admin.orders.size", locale)}</th>
              <th className="px-3 py-2">
                {t("admin.orders.customer", locale)}
              </th>
              <th className="px-3 py-2">{t("admin.orders.status", locale)}</th>
              <th className="px-3 py-2 text-end">
                {t("admin.orders.actions", locale)}
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                shoeName={
                  o.shoe_id != null
                    ? (shoeNameById[o.shoe_id] ?? `#${o.shoe_id}`)
                    : "—"
                }
                locale={locale}
              />
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  {t("admin.noResults", locale)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

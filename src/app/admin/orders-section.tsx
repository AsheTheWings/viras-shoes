"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteOrder, updateOrderStatus } from "./actions";
import type { AdminOrder } from "./dashboard";

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-GB");
}

function OrderRow({ order, shoeName }: { order: AdminOrder; shoeName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(order.status ?? "");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run(action: Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    start(async () => {
      const res = await action;
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
        {formatDate(order.created_at)}
      </td>
      <td className="px-3 py-2 font-medium">{shoeName}</td>
      <td className="px-3 py-2">{order.size ?? "—"}</td>
      <td className="px-3 py-2">
        <div>{order.customer_name ?? "—"}</div>
        <div className="text-xs text-neutral-500" dir="ltr">{order.customer_phone ?? ""}</div>
        <div className="text-xs text-neutral-500">{order.customer_email ?? ""}</div>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <Input
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
            Save
          </Button>
        </div>
      </td>
      <td className="px-3 py-2 text-right">
        {confirming ? (
          <span className="inline-flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => run(deleteOrder(order.id))}
            >
              Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
              Keep
            </Button>
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
            Delete
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
}: {
  orders: AdminOrder[];
  shoeNameById: Record<number, string>;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
        No orders yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-3 py-2">Placed</th>
            <th className="px-3 py-2">Shoe</th>
            <th className="px-3 py-2">Size</th>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              shoeName={o.shoe_id != null ? (shoeNameById[o.shoe_id] ?? `#${o.shoe_id}`) : "—"}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

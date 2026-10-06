"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Shoe, ShoeSize } from "@/lib/types";
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
}

export function AdminDashboard({ orders, shoes, sizes }: DashboardProps) {
  const [tab, setTab] = useState<"orders" | "shoes">("orders");
  const shoeNameById = Object.fromEntries(shoes.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={tab === "orders" ? "default" : "outline"}
            onClick={() => setTab("orders")}
          >
            Orders <Badge variant="secondary" className="ml-1">{orders.length}</Badge>
          </Button>
          <Button
            variant={tab === "shoes" ? "default" : "outline"}
            onClick={() => setTab("shoes")}
          >
            Shoes &amp; stock <Badge variant="secondary" className="ml-1">{shoes.length}</Badge>
          </Button>
        </div>
        <LogoutButton />
      </div>
      {tab === "orders" ? (
        <OrdersSection orders={orders} shoeNameById={shoeNameById} />
      ) : (
        <ShoesSection shoes={shoes} sizes={sizes} />
      )}
    </div>
  );
}

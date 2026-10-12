import "../shop.css";

import { ShopHeader } from "@/components/shop-header";
import { Ticker } from "@/components/ticker-server";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="shop-shell">
      <ShopHeader />
      <Ticker />
      <main>{children}</main>
    </div>
  );
}

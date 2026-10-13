import "../shop.css";

import { ShopHeader } from "@/components/shop-header";
import { ShopSettingsProvider } from "@/components/shop-settings";
import { Ticker } from "@/components/ticker-server";
import { getSiteSettings } from "@/lib/queries";

export default async function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return (
    <ShopSettingsProvider settings={settings}>
      <div className="shop-shell">
        <ShopHeader />
        <Ticker />
        <main>{children}</main>
      </div>
    </ShopSettingsProvider>
  );
}

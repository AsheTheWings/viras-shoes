"use client";

import { createContext, useContext } from "react";
import { parseSiteSettings, type SiteSettings } from "@/lib/site-settings";

const ShopSettingsContext = createContext<SiteSettings>(parseSiteSettings(null));

/** Provides admin-managed contact details and social links to the shop. */
export function ShopSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <ShopSettingsContext.Provider value={settings}>
      {children}
    </ShopSettingsContext.Provider>
  );
}

export function useShopSettings(): SiteSettings {
  return useContext(ShopSettingsContext);
}

"use client";

import { RefreshCw, ArrowUpRight } from "lucide-react";
import { useShopSettings } from "@/components/shop-settings";
import { useLocale } from "@/lib/locale-context";
import { formatShopPhone } from "@/lib/site-settings";

export default function ShopError({ reset }: { reset: () => void }) {
  const { t } = useLocale();
  const { contact } = useShopSettings();
  return (
    <div className="catalog-empty shop-error">
      <RefreshCw size={30} strokeWidth={1} />
      <h1>{t("shop.load.error")}</h1>
      <p>{t("shop.load.description")}</p>
      <button className="shop-button" onClick={reset}>
        {t("shop.retry")}
        <ArrowUpRight size={18} />
      </button>
      {contact.phone ? (
        <a href={`tel:${contact.phone}`}>
          {t("shop.call")} · <span dir="ltr">{formatShopPhone(contact.phone)}</span>
        </a>
      ) : contact.email ? (
        <a href={`mailto:${contact.email}`}>
          {t("shop.email")} · {contact.email}
        </a>
      ) : null}
    </div>
  );
}

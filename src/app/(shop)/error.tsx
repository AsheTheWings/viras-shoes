"use client";

import { RefreshCw, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

export default function ShopError({ reset }: { reset: () => void }) {
  const { t } = useLocale();
  return (
    <div className="catalog-empty shop-error">
      <RefreshCw size={30} strokeWidth={1} />
      <h1>{t("shop.load.error")}</h1>
      <p>{t("shop.load.description")}</p>
      <button className="shop-button" onClick={reset}>
        {t("shop.retry")}
        <ArrowUpRight size={18} />
      </button>
      <a href="tel:+212709722077">{t("shop.call")} · +212 709 722 077</a>
    </div>
  );
}

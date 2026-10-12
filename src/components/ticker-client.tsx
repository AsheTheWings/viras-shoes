"use client";

import { useLocale } from "@/lib/locale-context";

export function TickerClient() {
  const { t } = useLocale();
  return (
    <div className="shop-ticker" dir="ltr">
      <span className="sr-only">{t("ticker.text")}</span>
      <div className="ticker-track" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index}>{t("ticker.text")}</span>
        ))}
      </div>
    </div>
  );
}

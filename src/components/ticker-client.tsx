"use client";

import { useLocale } from "@/lib/locale-context";

interface TickerClientProps {
  initialIsRtl: boolean;
}

export function TickerClient({ initialIsRtl }: TickerClientProps) {
  const { t } = useLocale();

  return (
    <div className="overflow-hidden bg-[#7B3F1E] py-1.5" dir="ltr">
      <div
        className="flex w-max whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-[#F5D9C0] sm:text-xs"
        style={{
          animationName: "marquee",
          animationDuration: "var(--marquee-duration)",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="px-26">
            {t("ticker.text")}
          </span>
        ))}
      </div>
    </div>
  );
}

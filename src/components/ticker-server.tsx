import { headers } from "next/headers";
import { getInitialLocale, isRtl } from "@/lib/i18n";
import { TickerClient } from "./ticker-client";

export async function Ticker() {
  const headersList = await headers();
  const initialLocale = getInitialLocale(headersList);
  const isRtlLocale = isRtl(initialLocale);

  return <TickerClient initialIsRtl={isRtlLocale} />;
}

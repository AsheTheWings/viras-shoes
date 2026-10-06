import { headers } from "next/headers";
import { Phone, Mail } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Ticker } from "@/components/ticker-server";
import { LogoButton } from "@/components/logo-button";
import { getInitialLocale, isRtl } from "@/lib/i18n";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const initialLocale = getInitialLocale(headersList);
  const initialDir = isRtl(initialLocale) ? "rtl" : "ltr";

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
        <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-center px-4">
          <LogoButton />
          <div className="flex flex-col items-center gap-0.5 text-[10px] text-white/90 lg:hidden">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              viras.shoes@outlook.com
            </span>
            <span className="flex items-center gap-1" dir="ltr">
              <Phone className="h-3 w-3" />
              +212 709 722 077
            </span>
          </div>
          <div className="hidden items-center gap-5 text-sm text-white/90 lg:flex">
            <span className="flex items-center gap-1.5" dir="ltr">
              <Phone className="h-3.5 w-3.5" />
              +212 709 722 077
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              viras.shoes@outlook.com
            </span>
          </div>
          <div className="absolute end-4">
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <Ticker />
      <main className="min-h-0 flex-1" dir={initialDir}>{children}</main>
    </div>
  );
}

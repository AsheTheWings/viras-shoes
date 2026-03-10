import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import { Phone, Mail } from "lucide-react";
import { LocaleProvider } from "@/lib/locale-context";
import { HtmlLangSync } from "@/components/html-lang-sync";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Ticker } from "@/components/ticker";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viras Shoes",
  description: "Premium footwear by Viras. 6 handpicked styles, delivered to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geist.variable} flex h-dvh flex-col overflow-hidden font-sans antialiased`}>
        <LocaleProvider>
        <HtmlLangSync />
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
          <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-center px-4">
            <span className="absolute start-4 font-[family-name:var(--font-geist)] text-xl font-bold tracking-tight text-white">VIRAS</span>
            {/* Compact: stacked centered, email on top */}
            <div className="flex flex-col items-center gap-0.5 text-[10px] text-white/90 lg:hidden">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                viras.shoes@outlook.com
              </span>
              <span className="flex items-center gap-1" dir="ltr">
                <Phone className="h-3 w-3" />
                +212 765 115 050
              </span>
            </div>
            {/* Desktop: horizontal row */}
            <div className="hidden items-center gap-5 text-sm text-white/90 lg:flex">
              <span className="flex items-center gap-1.5" dir="ltr">
                <Phone className="h-3.5 w-3.5" />
                +212 765 115 050
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
        <main className="min-h-0 flex-1">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}

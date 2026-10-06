import type { Metadata } from "next";
import { headers } from "next/headers";
import { Poppins, Geist } from "next/font/google";
import { LocaleProvider } from "@/lib/locale-context";
import { HtmlLangSync } from "@/components/html-lang-sync";
import { getInitialLocale, isRtl } from "@/lib/i18n";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const initialLocale = getInitialLocale(headersList);
  const initialDir = isRtl(initialLocale) ? "rtl" : "ltr";

  return (
    <html lang={initialLocale} dir={initialDir}>
      <body className={`${poppins.variable} ${geist.variable} font-sans antialiased`}>
        <LocaleProvider>
        <HtmlLangSync />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}

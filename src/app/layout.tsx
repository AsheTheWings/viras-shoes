import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import { Phone, Mail } from "lucide-react";
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
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
          <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-center px-4">
            <span className="absolute left-4 font-[family-name:var(--font-geist)] text-xl font-bold tracking-tight text-white">VIRAS</span>
            <div className="flex items-center gap-5 text-sm text-white/90">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                +212 765 115 050
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                viras.shoes@outlook.com
              </span>
            </div>
          </div>
        </header>
        {/* Ticker band */}
        <div className="overflow-hidden bg-[#7B3F1E] py-1.5">
          <div
            className="flex w-max whitespace-nowrap text-xs font-medium uppercase tracking-widest text-[#F5D9C0]"
            style={{ animation: "marquee var(--marquee-duration) linear infinite" }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="px-26">
                New Collection &bull; March 2026 &bull; Handpicked Styles &bull;
              </span>
            ))}
          </div>
        </div>
        <main className="min-h-0 flex-1">{children}</main>
      </body>
    </html>
  );
}

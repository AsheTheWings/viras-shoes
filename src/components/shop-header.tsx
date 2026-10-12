"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/locale-context";
import { pathForLocale } from "@/lib/i18n";

export function ShopHeader() {
  const { t, locale } = useLocale();
  return (
    <>
      <a href="#collection" className="skip-link">
        {t("shop.skip")}
      </a>
      <header className="shop-header">
        <div className="header-inner">
          <Link
            href={pathForLocale(locale)}
            className="wordmark"
            aria-label="Viras Shoes"
          >
            VIRAS<span>®</span>
          </Link>
          <nav aria-label={t("shop.collection")}>
            <a href="#collection">{t("shop.collection")}</a>
            <a href="#contact">
              {t("shop.contact")}
              <ArrowUpRight size={13} />
            </a>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>
    </>
  );
}

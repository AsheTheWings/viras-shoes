"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Heart,
  Search,
  SlidersHorizontal,
  X,
  Mail,
  Phone,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductDetail } from "@/components/product-detail";
import { ShoePhoto } from "@/components/shoe-photo";
import { useLocale } from "@/lib/locale-context";
import {
  availableSizes,
  filterCatalog,
  formatPrice,
  type CatalogSort,
} from "@/lib/catalog";
import { useFavorites, useProductLink } from "@/lib/shop-preferences";
import type { ShoeWithSizes } from "@/lib/types";

export function ShoeGrid({ shoes }: { shoes: ShoeWithSizes[] }) {
  const { locale, t, dir } = useLocale();
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<number | null>(null);
  const [sort, setSort] = useState<CatalogSort>("featured");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { favorites, toggle } = useFavorites();
  const { productId, close } = useProductLink();
  const focused = shoes.find((shoe) => shoe.id === productId);
  const featured =
    shoes.find((shoe) => shoe.images.length && availableSizes(shoe).length) ??
    shoes[0];
  const visible = filterCatalog(shoes, {
    query,
    size,
    sort,
    favoritesOnly,
    favorites,
  });
  const sizes = Array.from(new Set(shoes.flatMap(availableSizes))).sort(
    (a, b) => a - b,
  );
  const activeFilters =
    query.trim() || size !== null || favoritesOnly || sort !== "featured";
  function reset() {
    setQuery("");
    setSize(null);
    setSort("featured");
    setFavoritesOnly(false);
  }

  return (
    <div className="storefront" dir={dir}>
      <section className="shop-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-rule" />
            {t("shop.eyebrow")}
          </p>
          <h1 id="hero-title">
            {t("shop.hero.line1")}
            <br />
            <span>{t("shop.hero.line2")}</span>
          </h1>
          <p className="hero-description">{t("shop.hero.description")}</p>
          <a className="shop-button" href="#collection">
            {t("shop.explore")}
            <ArrowUpRight size={19} className="directional-icon" />
          </a>
          <a href="#collection" className="hero-scroll">
            <ArrowDown size={15} />
            {t("shop.collection")}
          </a>
        </div>
        {featured && (
          <a
            href={`#shoe-${featured.id}`}
            className="hero-art"
            aria-label={`${t("shop.discover")} — ${featured.name}`}
          >
            <span className="hero-watermark" aria-hidden="true">
              V
            </span>
            <span className="hero-edition">
              VIRAS / {String(featured.item_number).padStart(2, "0")}
            </span>
            <div className="hero-photo">
              <ShoePhoto
                shoe={featured}
                hero
                priority
                sizes="(max-width: 800px) 100vw, 55vw"
              />
            </div>
            <div className="hero-caption">
              <div>
                <span>{t("shop.featured")}</span>
                <strong>{featured.name}</strong>
              </div>
              <span className="round-arrow">
                <ArrowUpRight size={22} />
              </span>
            </div>
          </a>
        )}
      </section>

      <section
        id="collection"
        className="collection"
        aria-labelledby="collection-title"
      >
        <div className="collection-heading">
          <div>
            <p className="eyebrow">VIRAS / {t("shop.collection")}</p>
            <h2 id="collection-title">{t("shop.edit")}</h2>
            <p>{t("shop.edit.description")}</p>
          </div>
          <span className="collection-count" aria-live="polite">
            {visible.length.toString().padStart(2, "0")}{" "}
            <span>{t("shop.results")}</span>
          </span>
        </div>
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={18} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("shop.search")}
              aria-label={t("shop.search")}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("shop.reset")}
              >
                <X size={16} />
              </button>
            )}
          </label>
          <div className="catalog-controls">
            <label className="catalog-select">
              <SlidersHorizontal size={15} />
              <select
                value={size ?? ""}
                onChange={(event) =>
                  setSize(
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                aria-label={t("order.size")}
              >
                <option value="">{t("shop.allSizes")}</option>
                {sizes.map((value) => (
                  <option key={value} value={value}>
                    EU {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="catalog-select">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as CatalogSort)}
                aria-label={t("shop.sort")}
              >
                <option value="featured">{t("shop.sort.featured")}</option>
                <option value="price-asc">{t("shop.sort.low")}</option>
                <option value="price-desc">{t("shop.sort.high")}</option>
                <option value="name">{t("shop.sort.name")}</option>
              </select>
            </label>
            <button
              className={`saved-filter ${favoritesOnly ? "is-active" : ""}`}
              aria-pressed={favoritesOnly}
              onClick={() => setFavoritesOnly(!favoritesOnly)}
            >
              <Heart size={16} fill={favoritesOnly ? "currentColor" : "none"} />
              <span>{t("shop.favorites")}</span>
              <span>{favorites.length}</span>
            </button>
          </div>
        </div>
        {activeFilters && (
          <div className="filter-summary">
            <button onClick={reset}>
              <X size={13} />
              {t("shop.reset")}
            </button>
            {size && <span>EU {size}</span>}
          </div>
        )}
        {visible.length ? (
          <div className="product-grid">
            {visible.map((shoe) => {
              const stockSizes = availableSizes(shoe);
              const saved = favorites.includes(shoe.id);
              return (
                <article className="product-card" key={shoe.id}>
                  <div className="product-image">
                    <a
                      href={`#shoe-${shoe.id}`}
                      aria-label={`${t("shop.view")} — ${shoe.name}`}
                    >
                      <ShoePhoto shoe={shoe} />
                      <span className="product-view">
                        {t("shop.view")}
                        <ArrowUpRight size={17} />
                      </span>
                    </a>
                    <span
                      className={`stock-badge ${stockSizes.length ? "" : "sold-out"}`}
                    >
                      <span />
                      {t(stockSizes.length ? "shop.available" : "shop.soldout")}
                    </span>
                    <button
                      className={`favorite-button ${saved ? "is-saved" : ""}`}
                      aria-label={`${t(saved ? "shop.unsave" : "shop.save")} — ${shoe.name}`}
                      aria-pressed={saved}
                      onClick={() => toggle(shoe.id)}
                    >
                      <Heart
                        size={19}
                        strokeWidth={1.6}
                        fill={saved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <div className="product-info">
                    <a href={`#shoe-${shoe.id}`}>
                      <span className="product-number">
                        VIRAS / {String(shoe.item_number).padStart(2, "0")}
                      </span>
                      <h3>{shoe.name}</h3>
                    </a>
                    <span className="product-price" dir="ltr">
                      {formatPrice(shoe.price, locale)}
                    </span>
                  </div>
                  <div className="product-sizes" aria-label={t("order.size")}>
                    {stockSizes.length ? (
                      <>
                        <span>EU</span>
                        {stockSizes.map((value) => (
                          <span key={value}>{value}</span>
                        ))}
                      </>
                    ) : (
                      <span>{t("shop.soldout")}</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="catalog-empty">
            <Search size={32} strokeWidth={1} />
            <h3>{t("shop.empty")}</h3>
            <p>{t("shop.empty.description")}</p>
            <button className="shop-button" onClick={reset}>
              {t("shop.reset")}
              <ArrowUpRight size={17} />
            </button>
          </div>
        )}
      </section>
      <section id="contact" className="contact-section">
        <div>
          <p className="eyebrow">VIRAS / {t("shop.contact")}</p>
          <h2>{t("shop.help")}</h2>
          <p>{t("shop.help.description")}</p>
        </div>
        <div className="contact-links">
          <a href="tel:+212709722077">
            <Phone size={19} />
            <span>
              {t("shop.call")}
              <strong dir="ltr">+212 709 722 077</strong>
            </span>
            <ArrowUpRight size={18} />
          </a>
          <a href="mailto:viras.shoes@outlook.com">
            <Mail size={19} />
            <span>
              {t("shop.email")}
              <strong>viras.shoes@outlook.com</strong>
            </span>
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <footer className="shop-footer">
        <span className="wordmark">
          VIRAS<span>®</span>
        </span>
        <p>{t("shop.footer")}</p>
        <span>© {new Date().getFullYear()} VIRAS</span>
      </footer>
      <Dialog
        open={!!focused}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        {focused && (
          <DialogContent
            showCloseButton={false}
            className="product-dialog"
            dir={dir}
          >
            <ProductDetail
              key={focused.id}
              shoe={focused}
              onClose={close}
              saved={favorites.includes(focused.id)}
              onToggleFavorite={() => toggle(focused.id)}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

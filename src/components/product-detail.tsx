"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  X,
  Expand,
  Check,
  ArrowUpRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoePhoto } from "@/components/shoe-photo";
import { OrderForm } from "@/components/order-form";
import { useLocale } from "@/lib/locale-context";
import { availableSizes, formatPrice } from "@/lib/catalog";
import type { TranslationKey } from "@/lib/i18n";
import type { ShoeWithSizes } from "@/lib/types";

export function ProductDetail({
  shoe,
  onClose,
  saved,
  onToggleFavorite,
}: {
  shoe: ShoeWithSizes;
  onClose: () => void;
  saved: boolean;
  onToggleFavorite: () => void;
}) {
  const { locale, t, dir } = useLocale();
  const [photo, setPhoto] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const inStock = availableSizes(shoe).length > 0;
  function step(amount: number) {
    setPhoto(
      (value) => (value + amount + shoe.images.length) % shoe.images.length,
    );
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  }

  return (
    <>
      <button
        className="detail-close icon-button"
        onClick={onClose}
        aria-label={t("shop.close")}
      >
        <X size={21} />
      </button>
      <div className="detail-gallery">
        <div
          className="detail-main-photo"
          onKeyDown={(event) => {
            if (shoe.images.length > 1 && event.key === "ArrowRight") step(1);
            if (shoe.images.length > 1 && event.key === "ArrowLeft") step(-1);
          }}
        >
          <ShoePhoto
            shoe={shoe}
            index={photo}
            hero
            priority
            sizes="(max-width: 800px) 100vw, 55vw"
          />
          {shoe.images.length > 0 && (
            <button
              className="gallery-zoom icon-button"
              onClick={() => setZoom(true)}
              aria-label={t("shop.zoom")}
            >
              <Expand size={18} />
            </button>
          )}
          {shoe.images.length > 1 && (
            <div className="gallery-navigation" dir="ltr">
              <button
                className="icon-button"
                onClick={() => step(-1)}
                aria-label={t("shop.previous")}
              >
                <ChevronLeft size={20} />
              </button>
              <span>
                {photo + 1} / {shoe.images.length}
              </span>
              <button
                className="icon-button"
                onClick={() => step(1)}
                aria-label={t("shop.next")}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
        {shoe.images.length > 1 && (
          <div className="gallery-thumbnails" dir="ltr">
            {shoe.images.map((image, index) => (
              <button
                key={image.stem}
                onClick={() => setPhoto(index)}
                aria-label={
                  image.side
                    ? t(`photo.side.${image.side}` as TranslationKey)
                    : `${t("shop.photo")} ${index + 1}`
                }
                aria-pressed={photo === index}
                className={photo === index ? "is-selected" : ""}
              >
                <ShoePhoto shoe={shoe} index={index} sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="detail-copy">
        <p className="eyebrow">
          VIRAS / {String(shoe.item_number).padStart(2, "0")}
        </p>
        <DialogTitle className="detail-title">{shoe.name}</DialogTitle>
        <p className="detail-price" dir="ltr">
          {formatPrice(shoe.price, locale)}
        </p>
        <DialogDescription className="detail-description">
          {shoe.description || t("shop.hero.description")}
        </DialogDescription>
        <p className={`detail-stock ${inStock ? "" : "sold-out"}`}>
          <span />
          {t(inStock ? "shop.available" : "shop.soldout")}
        </p>
        <OrderForm shoe={shoe} />
        <div className="detail-actions">
          <button onClick={onToggleFavorite} aria-pressed={saved}>
            <Heart size={17} fill={saved ? "currentColor" : "none"} />
            {t(saved ? "shop.unsave" : "shop.save")}
          </button>
          <button onClick={share}>
            {shareState === "copied" ? (
              <Check size={17} />
            ) : (
              <Share2 size={17} />
            )}
            {t(shareState === "copied" ? "shop.copied" : "shop.share")}
          </button>
        </div>
        {shareState === "error" && (
          <p role="status" className="field-error">
            {t("shop.share.error")}
          </p>
        )}
        <div className="detail-help">
          <span>{t("shop.help")}</span>
          <a href="tel:+212709722077" dir="ltr">
            +212 709 722 077
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent
          className="zoom-dialog"
          showCloseButton={false}
          dir={dir}
        >
          <DialogTitle className="sr-only">
            {shoe.name} — {t("shop.photo")} {photo + 1}
          </DialogTitle>
          <button
            className="detail-close icon-button"
            onClick={() => setZoom(false)}
            aria-label={t("shop.close")}
          >
            <X size={22} />
          </button>
          <div className="zoom-photo">
            <ShoePhoto shoe={shoe} index={photo} hero sizes="95vw" />
          </div>
          {shoe.images.length > 1 && (
            <div className="gallery-navigation" dir="ltr">
              <button
                className="icon-button"
                onClick={() => step(-1)}
                aria-label={t("shop.previous")}
              >
                <ChevronLeft />
              </button>
              <span>
                {photo + 1} / {shoe.images.length}
              </span>
              <button
                className="icon-button"
                onClick={() => step(1)}
                aria-label={t("shop.next")}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, CheckCircle2, LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { placeOrder } from "@/app/actions";
import { useLocale } from "@/lib/locale-context";
import { formatPrice } from "@/lib/catalog";
import { contactErrors, normalizePhone } from "@/lib/order-validation";
import type { ShoeWithSizes } from "@/lib/types";

export function OrderForm({ shoe }: { shoe: ShoeWithSizes }) {
  const { t, locale, dir } = useLocale();
  const id = useId();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    phone: false,
    email: false,
    contact: false,
  });
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);
  const [pending, start] = useTransition();
  const submitting = useRef(false);
  const sizes = Array.from({ length: 7 }, (_, index) => index + 39);

  function changeOpen(next: boolean) {
    if (submitting.current) return;
    setOpen(next);
    if (!next && result?.success) {
      setResult(null);
      setName("");
      setPhone("");
      setEmail("");
      setSelectedSize(null);
      setErrors({ phone: false, email: false, contact: false });
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSize || !name.trim() || submitting.current) return;
    const nextErrors = contactErrors(phone, email);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    submitting.current = true;
    setResult(null);
    start(async () => {
      try {
        const response = await placeOrder({
          shoe_id: shoe.id,
          size: selectedSize,
          customer_name: name.trim(),
          customer_phone: normalizePhone(phone),
          customer_email: email.trim(),
        });
        setResult(response);
        if (response.success) router.refresh();
      } catch {
        setResult({ success: false, error: "failed" });
      } finally {
        submitting.current = false;
      }
    });
  }

  return (
    <div className="order-panel">
      <div className="size-heading">
        <span>{t("order.choose")}</span>
        <span>EU</span>
      </div>
      <div className="size-picker" role="group" aria-label={t("order.choose")}>
        {sizes.map((size) => {
          const stock = shoe.sizes.find((row) => row.size === size)?.stock ?? 0;
          return (
            <button
              type="button"
              key={size}
              disabled={stock <= 0}
              aria-pressed={selectedSize === size}
              aria-label={`EU ${size}${stock <= 0 ? ` — ${t("shop.soldout")}` : ""}`}
              className={selectedSize === size ? "is-selected" : ""}
              onClick={() => {
                setSelectedSize(size);
                setResult(null);
              }}
            >
              {size}
            </button>
          );
        })}
      </div>
      <p className="size-hint" aria-live="polite">
        {selectedSize ? (
          <>
            <Check size={13} />
            {t("order.selected")} — EU {selectedSize}
          </>
        ) : (
          t("order.hint")
        )}
      </p>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogTrigger
          render={
            <button
              className="shop-button order-button"
              disabled={!selectedSize}
            />
          }
        >
          {t("order.now")}
          <ArrowUpRight size={19} />
        </DialogTrigger>
        <DialogContent
          className="checkout-dialog"
          dir={dir}
          closeLabel={t("shop.close")}
          showCloseButton={!pending}
        >
          {result?.success ? (
            <div className="order-success" role="status">
              <span className="success-icon">
                <CheckCircle2 size={34} strokeWidth={1.5} />
              </span>
              <DialogTitle>{t("order.success.title")}</DialogTitle>
              <DialogDescription>
                {t("order.success.message")}
              </DialogDescription>
              <div className="checkout-summary">
                <strong>{shoe.name}</strong>
                <span>EU {selectedSize}</span>
                <span dir="ltr">{formatPrice(shoe.price, locale)}</span>
              </div>
              <button className="shop-button" onClick={() => changeOpen(false)}>
                {t("order.continue")}
                <ArrowUpRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <p className="eyebrow">VIRAS / {t("order.review")}</p>
              <DialogTitle className="checkout-title">
                {t("order.contact")}
              </DialogTitle>
              <DialogDescription>{t("order.note")}</DialogDescription>
              <div className="checkout-summary">
                <strong>{shoe.name}</strong>
                <span>EU {selectedSize}</span>
                <span dir="ltr">{formatPrice(shoe.price, locale)}</span>
              </div>
              <form
                onSubmit={submit}
                className="checkout-form"
                aria-busy={pending}
              >
                <label htmlFor={`${id}-name`}>
                  {t("order.name")}
                  <input
                    id={`${id}-name`}
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    maxLength={120}
                    placeholder={t("order.name.placeholder")}
                    required
                    disabled={pending}
                  />
                </label>
                <label htmlFor={`${id}-phone`}>
                  {t("order.phone")}
                  <input
                    id={`${id}-phone`}
                    name="tel"
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={40}
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        phone: false,
                        contact: false,
                      }));
                    }}
                    disabled={pending}
                    aria-invalid={errors.phone}
                    aria-describedby={
                      errors.phone ? `${id}-phone-error` : undefined
                    }
                  />
                  {errors.phone && (
                    <span id={`${id}-phone-error`} className="field-error">
                      {t("validation.phone")}
                    </span>
                  )}
                </label>
                <label htmlFor={`${id}-email`}>
                  {t("order.email")}
                  <input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    maxLength={254}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        email: false,
                        contact: false,
                      }));
                    }}
                    disabled={pending}
                    aria-invalid={errors.email}
                    aria-describedby={
                      errors.email ? `${id}-email-error` : undefined
                    }
                  />
                  {errors.email && (
                    <span id={`${id}-email-error`} className="field-error">
                      {t("validation.email")}
                    </span>
                  )}
                </label>
                {errors.contact && (
                  <p className="field-error" role="alert">
                    {t("order.contact.required")}
                  </p>
                )}
                {result?.error && (
                  <p className="field-error" role="alert">
                    {t(
                      result.error === "stock"
                        ? "order.stock.error"
                        : result.error === "invalid"
                          ? "order.contact.required"
                          : "order.error",
                    )}
                  </p>
                )}
                <button
                  type="submit"
                  className="shop-button order-button"
                  disabled={pending || !name.trim()}
                >
                  {pending ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      {t("order.placing")}
                    </>
                  ) : (
                    <>
                      {t("order.confirm")}
                      <span dir="ltr">{formatPrice(shoe.price, locale)}</span>
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

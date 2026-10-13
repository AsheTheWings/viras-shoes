import { t, type Locale, type TranslationKey } from "./i18n";

/** Stable failure codes that admin server actions return. */
export const ADMIN_ERRORS = [
  "not_signed_in",
  "not_configured",
  "name_empty",
  "price_invalid",
  "item_number_invalid",
  "item_number_taken",
  "stock_invalid",
  "size_invalid",
  "size_taken",
  "status_invalid",
  "shoe_unknown",
  "shoe_has_orders",
  "image_missing",
  "image_too_large",
  "image_invalid",
  "image_unknown",
  "fields_invalid",
  "failed",
] as const;

export type AdminErrorCode = (typeof ADMIN_ERRORS)[number];

export type AdminResult =
  | { ok: true }
  | { ok: false; error: AdminErrorCode; fields?: string[] };

/** Message for an error code in the admin's language. */
export function adminErrorText(code: string, locale: Locale): string {
  const known = (ADMIN_ERRORS as readonly string[]).includes(code)
    ? code
    : "failed";
  return t(`admin.error.${known}` as TranslationKey, locale);
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Translated label for a stored status; unrecognized values show as stored. */
export function orderStatusLabel(value: string | null, locale: Locale): string {
  if (!value) return "—";
  return isOrderStatus(value)
    ? t(`admin.orders.status.${value}` as TranslationKey, locale)
    : value;
}

// Pure shop settings rules: contact details and social profiles.
import {
  SOCIAL_PLATFORMS,
  normalizeSocialLink,
  type SocialLinks,
} from "./social.ts";

export interface ShopContact {
  /** E.164 phone number, e.g. +212709722077, or null when hidden. */
  phone: string | null;
  email: string | null;
}

export interface SiteSettings {
  contact: ShopContact;
  social: SocialLinks;
}

/** Contact shown until an admin saves contact details. */
export const DEFAULT_CONTACT: ShopContact = {
  phone: "+212709722077",
  email: "viras.shoes@outlook.com",
};

/**
 * Canonical E.164 phone number. Accepts international numbers with `+` or
 * `00`, and Moroccan local numbers (05, 06, 07), which get the 212 prefix.
 */
export function normalizeShopPhone(
  raw: string,
): { ok: true; phone: string | null } | { ok: false } {
  const value = raw.trim();
  if (!value) return { ok: true, phone: null };
  if (value.length > 40 || !/^[+\d][\d\s().-]*$/.test(value)) return { ok: false };
  let digits = value.replace(/\D/g, "");
  if (value.startsWith("00")) digits = digits.slice(2);
  else if (!value.startsWith("+")) {
    if (!/^0[5-7]\d{8}$/.test(digits)) return { ok: false };
    digits = `212${digits.slice(1)}`;
  }
  // "+212 06…" style entries keep the national trunk zero; drop it.
  if (/^2120[5-7]\d{8}$/.test(digits)) digits = `212${digits.slice(4)}`;
  if (digits.startsWith("212") && !/^212[5-7]\d{8}$/.test(digits)) return { ok: false };
  return /^[1-9]\d{7,14}$/.test(digits) ? { ok: true, phone: `+${digits}` } : { ok: false };
}

/** Readable form of an E.164 number; Moroccan numbers group as +212 7XX XXX XXX. */
export function formatShopPhone(phone: string): string {
  const ma = /^\+212(\d{3})(\d{3})(\d{3})$/.exec(phone);
  return ma ? `+212 ${ma[1]} ${ma[2]} ${ma[3]}` : phone;
}

export function normalizeShopEmail(
  raw: string,
): { ok: true; email: string | null } | { ok: false } {
  const value = raw.trim().toLowerCase();
  if (!value) return { ok: true, email: null };
  return value.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value)
    ? { ok: true, email: value }
    : { ok: false };
}

function parseContact(raw: unknown): ShopContact {
  if (!raw || typeof raw !== "object") return DEFAULT_CONTACT;
  const source = raw as Record<string, unknown>;
  const phone = normalizeShopPhone(typeof source.phone === "string" ? source.phone : "");
  const email = normalizeShopEmail(typeof source.email === "string" ? source.email : "");
  return {
    phone: phone.ok ? phone.phone : null,
    email: email.ok ? email.email : null,
  };
}

function parseSocial(raw: unknown): SocialLinks {
  const social: SocialLinks = {};
  if (!raw || typeof raw !== "object") return social;
  for (const platform of SOCIAL_PLATFORMS) {
    const value = (raw as Record<string, unknown>)[platform];
    if (typeof value !== "string") continue;
    const result = normalizeSocialLink(platform, value);
    if (result.ok && result.url) social[platform] = result.url;
  }
  return social;
}

/**
 * Validated settings from stored JSON; invalid or unknown entries drop out.
 * Settings saved without contact details keep the default contact.
 */
export function parseSiteSettings(raw: unknown): SiteSettings {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return { contact: parseContact(source.contact), social: parseSocial(source.social) };
}

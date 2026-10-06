"use server";

import { cookies } from "next/headers";
import { LOCALES, type Locale } from "./i18n";

// Remembers the language applied in the shop so pages outside the
// locale-prefixed routes (such as /admin) can respect it.
export async function rememberLocale(locale: Locale): Promise<void> {
  if (!(LOCALES as readonly string[]).includes(locale)) return;
  const jar = await cookies();
  jar.set("viras_locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

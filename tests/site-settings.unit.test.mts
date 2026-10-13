import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_CONTACT,
  formatShopPhone,
  normalizeShopEmail,
  normalizeShopPhone,
  parseSiteSettings,
} from "../src/lib/site-settings.ts";

const phone = (raw: string) => {
  const result = normalizeShopPhone(raw);
  return result.ok ? result.phone : "invalid";
};

test("unit: shop phone numbers normalize to E.164", () => {
  for (const raw of ["0709722077", "07 09 72 20 77", "+212 709 722 077", "00212709722077", "+212 0709722077"])
    assert.equal(phone(raw), "+212709722077", raw);
  assert.equal(phone("+33 6 12 34 56 78"), "+33612345678");
  assert.equal(phone(""), null);
  for (const raw of ["0812345678", "070972207", "+212 12345", "call me", "+0123456789"])
    assert.equal(phone(raw), "invalid", raw);
  assert.equal(formatShopPhone("+212709722077"), "+212 709 722 077");
  assert.equal(formatShopPhone("+33612345678"), "+33612345678");
});

test("unit: shop emails are trimmed, lowercased, and validated", () => {
  assert.deepEqual(normalizeShopEmail(" Viras.Shoes@Outlook.com "), { ok: true, email: "viras.shoes@outlook.com" });
  assert.deepEqual(normalizeShopEmail(""), { ok: true, email: null });
  assert.deepEqual(normalizeShopEmail("not-an-email"), { ok: false });
  assert.deepEqual(normalizeShopEmail("a@b.c<script>"), { ok: false });
});

test("unit: stored settings keep valid entries and default only a missing contact", () => {
  assert.deepEqual(parseSiteSettings(null), { contact: DEFAULT_CONTACT, social: {} });
  assert.deepEqual(
    parseSiteSettings({
      social: { instagram: "@viras", facebook: "https://evil.example/x", myspace: "@a", x: 4 },
    }),
    { contact: DEFAULT_CONTACT, social: { instagram: "https://www.instagram.com/viras" } },
  );
  assert.deepEqual(
    parseSiteSettings({ contact: { phone: "0612345678", email: null }, social: {} }),
    { contact: { phone: "+212612345678", email: null }, social: {} },
  );
});

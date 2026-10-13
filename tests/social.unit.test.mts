import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeSocialLink } from "../src/lib/social.ts";

const url = (platform: Parameters<typeof normalizeSocialLink>[0], raw: string) => {
  const result = normalizeSocialLink(platform, raw);
  return result.ok ? result.url : "invalid";
};

test("unit: handles and bare domains become canonical https profile links", () => {
  assert.equal(url("instagram", "@viras.shoes"), "https://www.instagram.com/viras.shoes");
  assert.equal(url("tiktok", "viras"), "https://www.tiktok.com/@viras");
  assert.equal(url("youtube", "@viras"), "https://www.youtube.com/@viras");
  assert.equal(url("facebook", "facebook.com/viras"), "https://facebook.com/viras");
  assert.equal(url("x", "http://twitter.com/viras"), "https://twitter.com/viras");
  assert.equal(url("instagram", "  "), null);
});

test("unit: WhatsApp accepts phone numbers and chat links", () => {
  assert.equal(url("whatsapp", "06 12 34 56 78"), "https://wa.me/212612345678");
  assert.equal(url("whatsapp", "+212 612-345-678"), "https://wa.me/212612345678");
  assert.equal(url("whatsapp", "00212612345678"), "https://wa.me/212612345678");
  assert.equal(url("whatsapp", "wa.me/212612345678"), "https://wa.me/212612345678");
  assert.equal(url("whatsapp", "123"), "invalid");
});

test("unit: links to other hosts, credentials, scripts, and bare homepages are rejected", () => {
  for (const raw of [
    "https://evil.example/instagram.com",
    "https://instagram.com.evil.example/viras",
    "https://user:pass@instagram.com/viras",
    "javascript:alert(1)",
    "https://instagram.com/",
    "bad handle!",
  ]) {
    assert.equal(url("instagram", raw), "invalid", raw);
  }
});

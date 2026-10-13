// Pure social-profile rules shared by the admin and the shop.

export const SOCIAL_PLATFORMS = [
  "instagram",
  "facebook",
  "tiktok",
  "whatsapp",
  "youtube",
  "snapchat",
  "x",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type SocialLinks = Partial<Record<SocialPlatform, string>>;

export const SOCIAL_NAMES: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
  snapchat: "Snapchat",
  x: "X",
};

export const SOCIAL_EXAMPLES: Record<SocialPlatform, string> = {
  instagram: "@viras.shoes",
  facebook: "facebook.com/virasshoes",
  tiktok: "@viras.shoes",
  whatsapp: "+212 6 12 34 56 78",
  youtube: "@virasshoes",
  snapchat: "virasshoes",
  x: "@virasshoes",
};

const HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ["instagram.com", "instagr.am"],
  facebook: ["facebook.com", "fb.com", "fb.me"],
  tiktok: ["tiktok.com"],
  whatsapp: ["wa.me", "whatsapp.com"],
  youtube: ["youtube.com", "youtu.be"],
  snapchat: ["snapchat.com"],
  x: ["x.com", "twitter.com"],
};

const HANDLE_URL: Record<Exclude<SocialPlatform, "whatsapp">, (h: string) => string> = {
  instagram: (h) => `https://www.instagram.com/${h}`,
  facebook: (h) => `https://www.facebook.com/${h}`,
  tiktok: (h) => `https://www.tiktok.com/@${h}`,
  youtube: (h) => `https://www.youtube.com/@${h}`,
  snapchat: (h) => `https://www.snapchat.com/add/${h}`,
  x: (h) => `https://x.com/${h}`,
};

const MAX_INPUT = 300;

function hostMatches(platform: SocialPlatform, host: string): boolean {
  const h = host.toLowerCase();
  return HOSTS[platform].some((d) => h === d || h.endsWith(`.${d}`));
}

function looksLikeUrl(platform: SocialPlatform, value: string): boolean {
  if (/^https?:\/\//i.test(value) || value.includes("/")) return true;
  const lower = value.toLowerCase();
  return HOSTS[platform].some((d) => lower === d || lower.startsWith(`www.${d}`));
}

/** Canonical WhatsApp chat link; Moroccan local numbers get the 212 prefix. */
function whatsappFromPhone(value: string): string | null {
  if (!/^[+\d][\d\s().-]*$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (value.trim().startsWith("00")) digits = digits.slice(2);
  else if (/^0[5-7]\d{8}$/.test(digits)) digits = `212${digits.slice(1)}`;
  return digits.length >= 8 && digits.length <= 15 ? `https://wa.me/${digits}` : null;
}

/**
 * Turns an admin entry (profile URL, @handle, or for WhatsApp a phone number)
 * into a canonical https link. Empty input clears the link (`url: null`).
 */
export function normalizeSocialLink(
  platform: SocialPlatform,
  raw: string,
): { ok: true; url: string | null } | { ok: false } {
  const value = raw.trim();
  if (!value) return { ok: true, url: null };
  if (value.length > MAX_INPUT) return { ok: false };
  if (platform === "whatsapp") {
    const phone = whatsappFromPhone(value);
    if (phone) return { ok: true, url: phone };
  } else if (!looksLikeUrl(platform, value)) {
    const handle = value.replace(/^@/, "");
    return /^[A-Za-z0-9._-]{1,60}$/.test(handle)
      ? { ok: true, url: HANDLE_URL[platform](handle) }
      : { ok: false };
  }
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return { ok: false };
  }
  if (url.username || url.password || !hostMatches(platform, url.hostname)) {
    return { ok: false };
  }
  url.protocol = "https:";
  if (url.pathname === "/" && !url.search) return { ok: false };
  return { ok: true, url: url.toString() };
}

/** Configured links in display order. */
export function socialEntries(
  links: SocialLinks,
): { platform: SocialPlatform; url: string }[] {
  return SOCIAL_PLATFORMS.flatMap((platform) =>
    links[platform] ? [{ platform, url: links[platform]! }] : [],
  );
}

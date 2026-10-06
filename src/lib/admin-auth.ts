// Server-only: authentication helpers for the /admin area.
// Never import this module from a client component.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "viras_admin";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export function getAdminCode(): string | null {
  const code = process.env.ADMIN_CODE;
  return code && code.length > 0 ? code : null;
}

function hashCode(code: string): Buffer {
  return createHash("sha256").update(code, "utf8").digest();
}

// Constant-time comparison that also hides the code length.
export function verifyCode(input: string): boolean {
  const expected = getAdminCode();
  if (!expected) return false;
  const a = hashCode(input);
  const b = hashCode(expected);
  return timingSafeEqual(a, b);
}

function signSession(sid: string, exp: number, code: string): string {
  return createHmac("sha256", code).update(`${sid}.${exp}`, "utf8").digest("hex");
}

// Stateless session: sid.exp.hmac. Rotating ADMIN_CODE invalidates all sessions.
export function createSession(): string {
  const code = getAdminCode();
  if (!code) throw new Error("ADMIN_CODE is not configured");
  const sid = randomBytes(16).toString("hex");
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${sid}.${exp}.${signSession(sid, exp, code)}`;
}

export function verifySession(value: string | undefined | null): boolean {
  const code = getAdminCode();
  if (!code || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [sid, expRaw, sig] = parts;
  if (!/^[0-9a-f]{32}$/.test(sid)) return false;
  const exp = Number(expRaw);
  if (!Number.isInteger(exp) || exp <= Math.floor(Date.now() / 1000)) return false;
  const expected = signSession(sid, exp, code);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

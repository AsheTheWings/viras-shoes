"use server";

import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  createSession,
  getAdminCode,
  verifyCode,
  verifySession,
} from "@/lib/admin-auth";
import {
  isOrderStatus,
  type AdminErrorCode,
  type AdminResult,
} from "@/lib/admin-errors";
import { isPhotoSide, parseStem, uploadFilename } from "@/lib/photo-sides";
import { SETTINGS_PATH, listAssetNames, serviceDb } from "@/lib/shoe-images";
import {
  SOCIAL_PLATFORMS,
  normalizeSocialLink,
  type SiteSettings,
} from "@/lib/social";

export type LoginResult =
  | { ok: true }
  | { ok: false; error: "unconfigured" | "locked" | "wrong" };

const done = (): AdminResult => ({ ok: true });
const fail = (error: AdminErrorCode, fields?: string[]): AdminResult => ({
  ok: false,
  error,
  ...(fields ? { fields } : {}),
});

// Login rate limiting. In-memory per process; resets on restart.
const attempts = new Map<string, { fails: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const MAX_LOGIN_FAILS = 8;

async function callerIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function signedIn(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(ADMIN_COOKIE)?.value);
}

export async function loginAdmin(code: string): Promise<LoginResult> {
  if (!getAdminCode()) return { ok: false, error: "unconfigured" };
  const ip = await callerIp();
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.resetAt > now && rec.fails >= MAX_LOGIN_FAILS) {
    return { ok: false, error: "locked" };
  }
  if (!verifyCode(code)) {
    const next = rec && rec.resetAt > now ? rec.fails + 1 : 1;
    attempts.set(ip, { fails: next, resetAt: now + LOGIN_WINDOW_MS });
    return { ok: false, error: "wrong" };
  }
  attempts.delete(ip);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

class ActionError extends Error {
  constructor(readonly code: AdminErrorCode) {
    super(code);
  }
}

/**
 * Runs an admin mutation: checks the session, maps validation failures to
 * their codes and any other failure to `failed`, and refreshes changed pages.
 */
async function adminAction(
  work: (db: SupabaseClient) => Promise<void>,
  paths: string[] = ["/admin"],
): Promise<AdminResult> {
  if (!(await signedIn())) return fail("not_signed_in");
  let db: SupabaseClient;
  try {
    db = serviceDb();
  } catch {
    return fail("not_configured");
  }
  try {
    await work(db);
  } catch (e) {
    return fail(e instanceof ActionError ? e.code : "failed");
  }
  for (const path of paths) revalidatePath(path);
  return done();
}

const SHOP_PATHS = ["/admin", "/", "/en", "/fr"];

function wholeNumber(value: string, code: AdminErrorCode): number {
  const raw = value.trim();
  if (!/^-?\d+$/.test(raw)) throw new ActionError(code);
  return Number(raw);
}

function shoeFields(input: { name: string; price: string; description: string }) {
  const name = input.name.trim().slice(0, 120);
  if (!name) throw new ActionError("name_empty");
  const rawPrice = input.price.trim().replace(",", ".");
  const price = Number(rawPrice);
  if (!rawPrice || !Number.isFinite(price) || price < 0) {
    throw new ActionError("price_invalid");
  }
  const description = input.description.trim().slice(0, 2000);
  return { name, price, description: description || null };
}

function check(error: unknown): void {
  if (error) throw error;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<AdminResult> {
  return adminAction(async (db) => {
    if (!isOrderStatus(status)) throw new ActionError("status_invalid");
    const { error } = await db.from("orders").update({ status }).eq("id", orderId);
    check(error);
  });
}

export async function deleteOrder(orderId: string): Promise<AdminResult> {
  return adminAction(async (db) => {
    const { error } = await db.from("orders").delete().eq("id", orderId);
    check(error);
  });
}

export async function updateShoe(
  shoeId: number,
  input: { name: string; price: string; description: string },
): Promise<AdminResult> {
  return adminAction(async (db) => {
    const fields = shoeFields(input);
    const { data, error } = await db
      .from("shoes")
      .update(fields)
      .eq("id", shoeId)
      .select("id");
    check(error);
    if (!data?.length) throw new ActionError("shoe_unknown");
  }, SHOP_PATHS);
}

export async function createShoe(input: {
  itemNumber: string;
  name: string;
  price: string;
  description: string;
}): Promise<AdminResult> {
  return adminAction(async (db) => {
    const itemNumber = wholeNumber(input.itemNumber, "item_number_invalid");
    if (itemNumber <= 0) throw new ActionError("item_number_invalid");
    const fields = shoeFields(input);
    const { data: existing, error: lookupError } = await db
      .from("shoes")
      .select("id")
      .eq("item_number", itemNumber)
      .limit(1);
    check(lookupError);
    if (existing?.length) throw new ActionError("item_number_taken");
    const { error } = await db
      .from("shoes")
      .insert({ item_number: itemNumber, ...fields });
    check(error);
  }, SHOP_PATHS);
}

/** Bucket files belonging to an item number, optionally only one side. */
function itemFiles(
  names: string[],
  itemNumber: number,
  side?: string,
): string[] {
  return names.filter((name) => {
    const dot = name.lastIndexOf(".");
    if (dot === -1) return false;
    const parsed = parseStem(name.slice(0, dot));
    if (!parsed || parsed.item !== itemNumber) return false;
    return side === undefined || parsed.side === side;
  });
}

export async function deleteShoe(shoeId: number): Promise<AdminResult> {
  return adminAction(async (db) => {
    const { data: shoe, error: shoeError } = await db
      .from("shoes")
      .select("item_number")
      .eq("id", shoeId)
      .maybeSingle();
    check(shoeError);
    if (!shoe) throw new ActionError("shoe_unknown");
    // Orders reference the shoe; refuse before removing anything.
    const { count, error: ordersError } = await db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("shoe_id", shoeId);
    check(ordersError);
    if (count) throw new ActionError("shoe_has_orders");
    const { error: sizesError } = await db
      .from("shoe_sizes")
      .delete()
      .eq("shoe_id", shoeId);
    check(sizesError);
    const { error } = await db.from("shoes").delete().eq("id", shoeId);
    check(error);
    // Photos are keyed by item number; remove them so a future shoe with
    // the same number starts with an empty gallery.
    const photos = itemFiles(await listAssetNames(db), shoe.item_number);
    if (photos.length) {
      const { error: removeError } = await db.storage.from("assets").remove(photos);
      check(removeError);
    }
  }, SHOP_PATHS);
}

export async function setSizeStock(
  sizeId: number,
  stock: string,
): Promise<AdminResult> {
  return adminAction(async (db) => {
    const n = wholeNumber(stock, "stock_invalid");
    if (n < 0) throw new ActionError("stock_invalid");
    const { error } = await db.from("shoe_sizes").update({ stock: n }).eq("id", sizeId);
    check(error);
  }, SHOP_PATHS);
}

export async function addShoeSize(
  shoeId: number,
  size: string,
  stock: string,
): Promise<AdminResult> {
  return adminAction(async (db) => {
    const sizeNum = wholeNumber(size, "size_invalid");
    if (sizeNum < 39 || sizeNum > 45) throw new ActionError("size_invalid");
    const stockNum = wholeNumber(stock, "stock_invalid");
    if (stockNum < 0) throw new ActionError("stock_invalid");
    const { data: existing, error: lookupError } = await db
      .from("shoe_sizes")
      .select("id")
      .eq("shoe_id", shoeId)
      .eq("size", sizeNum)
      .limit(1);
    check(lookupError);
    if (existing?.length) throw new ActionError("size_taken");
    const { error } = await db
      .from("shoe_sizes")
      .insert({ shoe_id: shoeId, size: sizeNum, stock: stockNum });
    check(error);
  }, SHOP_PATHS);
}

export async function deleteShoeSize(sizeId: number): Promise<AdminResult> {
  return adminAction(async (db) => {
    const { error } = await db.from("shoe_sizes").delete().eq("id", sizeId);
    check(error);
  }, SHOP_PATHS);
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "heif"]);

/** Re-encodes an upload as an upright WebP no larger than 2000px. */
async function toWebp(bytes: Buffer): Promise<Buffer> {
  try {
    const image = sharp(bytes, { limitInputPixels: 60_000_000 });
    const meta = await image.metadata();
    if (!meta.format || !ACCEPTED_FORMATS.has(meta.format)) {
      throw new ActionError("image_invalid");
    }
    return await image
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();
  } catch (e) {
    throw e instanceof ActionError ? e : new ActionError("image_invalid");
  }
}

async function assertItem(db: SupabaseClient, itemNumber: number): Promise<void> {
  if (!Number.isInteger(itemNumber) || itemNumber <= 0) {
    throw new ActionError("shoe_unknown");
  }
  const { data, error } = await db
    .from("shoes")
    .select("id")
    .eq("item_number", itemNumber)
    .limit(1);
  check(error);
  if (!data?.length) throw new ActionError("shoe_unknown");
}

/**
 * Stores one photo for a shoe. With a side, the photo replaces that side's
 * current photo; without one it is added to the additional photos.
 */
export async function uploadShoePhoto(
  itemNumber: number,
  side: string | null,
  formData: FormData,
): Promise<AdminResult> {
  return adminAction(async (db) => {
    if (side !== null && !isPhotoSide(side)) throw new ActionError("image_unknown");
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      throw new ActionError("image_missing");
    }
    if (file.size > MAX_IMAGE_BYTES) throw new ActionError("image_too_large");
    await assertItem(db, itemNumber);
    const webp = await toWebp(Buffer.from(await file.arrayBuffer()));
    const token = `${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
    const name = uploadFilename(itemNumber, side, token);
    const bucket = db.storage.from("assets");
    const previous = side ? itemFiles(await listAssetNames(db), itemNumber, side) : [];
    const { error } = await bucket.upload(name, webp, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
    check(error);
    if (previous.length) {
      const { error: removeError } = await bucket.remove(previous);
      check(removeError);
    }
  }, SHOP_PATHS);
}

export async function deleteShoeImage(
  itemNumber: number,
  stem: string,
): Promise<AdminResult> {
  return adminAction(async (db) => {
    const parsed = parseStem(stem);
    // Keys the photo to this shoe's gallery and blocks path traversal.
    if (!parsed || parsed.item !== itemNumber) throw new ActionError("image_unknown");
    // A photo is every twin sharing the stem; removing one entry removes all.
    const twins = (await listAssetNames(db)).filter((name) =>
      name.startsWith(`${stem}.`),
    );
    if (twins.length === 0) throw new ActionError("image_unknown");
    const { error } = await db.storage.from("assets").remove(twins);
    check(error);
  }, SHOP_PATHS);
}

export async function saveSocialLinks(
  input: Record<string, string>,
): Promise<AdminResult> {
  if (!(await signedIn())) return fail("not_signed_in");
  const settings: SiteSettings = { social: {} };
  const invalid: string[] = [];
  for (const platform of SOCIAL_PLATFORMS) {
    const result = normalizeSocialLink(platform, String(input[platform] ?? ""));
    if (!result.ok) invalid.push(platform);
    else if (result.url) settings.social[platform] = result.url;
  }
  if (invalid.length) return fail("social_invalid", invalid);
  return adminAction(async (db) => {
    const { error } = await db.storage
      .from("assets")
      .upload(SETTINGS_PATH, JSON.stringify(settings, null, 2), {
        contentType: "application/json",
        cacheControl: "0",
        upsert: true,
      });
    check(error);
  }, SHOP_PATHS);
}

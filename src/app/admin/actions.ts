"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  createSession,
  getAdminCode,
  verifyCode,
  verifySession,
} from "@/lib/admin-auth";
import { IMAGE_VARIANTS } from "@/lib/types";

export type AdminResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): AdminResult => ({ ok: false, error });
const done = (): AdminResult => ({ ok: true });

// Login rate limiting. In-memory per process; resets on restart.
const attempts = new Map<string, { fails: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const MAX_LOGIN_FAILS = 8;

async function callerIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function adminDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Admin database access is not configured");
  return createClient(url, key);
}

async function assertAdmin(): Promise<string | null> {
  const jar = await cookies();
  return verifySession(jar.get(ADMIN_COOKIE)?.value) ? null : "Not signed in";
}

export async function loginAdmin(code: string): Promise<AdminResult> {
  if (!getAdminCode()) return fail("unconfigured");
  const ip = await callerIp();
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.resetAt > now && rec.fails >= MAX_LOGIN_FAILS) {
    return fail("locked");
  }
  if (!verifyCode(code)) {
    const next = rec && rec.resetAt > now ? rec.fails + 1 : 1;
    attempts.set(ip, { fails: next, resetAt: now + LOGIN_WINDOW_MS });
    return fail("wrong");
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
  return done();
}

export async function logoutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

function toError(e: unknown): string {
  return e instanceof Error ? e.message : "Request failed";
}

function parseCount(value: FormDataEntryValue | string | null, label: string): number {
  const raw = typeof value === "string" ? value : (value?.toString() ?? "");
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new Error(`${label} must be a whole number`);
  return n;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  const s = status.trim().slice(0, 40);
  if (!s) return fail("Status is empty");
  try {
    const { error } = await adminDb().from("orders").update({ status: s }).eq("id", orderId);
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

export async function deleteOrder(orderId: string): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  try {
    const { error } = await adminDb().from("orders").delete().eq("id", orderId);
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

export async function updateShoe(
  shoeId: number,
  input: { name: string; price: string; description: string },
): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  const name = input.name.trim().slice(0, 120);
  if (!name) return fail("Name is empty");
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) return fail("Price must be 0 or more");
  const description = input.description.trim().slice(0, 2000);
  try {
    const { error } = await adminDb()
      .from("shoes")
      .update({ name, price, description: description || null })
      .eq("id", shoeId);
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

export async function createShoe(input: {
  itemNumber: string;
  name: string;
  price: string;
  description: string;
}): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  let itemNumber: number;
  try {
    itemNumber = parseCount(input.itemNumber, "Item number");
  } catch (e) {
    return fail(toError(e));
  }
  if (itemNumber <= 0) return fail("Item number must be positive");
  const name = input.name.trim().slice(0, 120);
  if (!name) return fail("Name is empty");
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) return fail("Price must be 0 or more");
  const description = input.description.trim().slice(0, 2000);
  try {
    const db = adminDb();
    const { data: existing, error: lookupError } = await db
      .from("shoes")
      .select("id")
      .eq("item_number", itemNumber)
      .limit(1);
    if (lookupError) throw lookupError;
    if (existing && existing.length > 0) return fail("Item number is already used");
    const { error } = await db
      .from("shoes")
      .insert({ item_number: itemNumber, name, price, description: description || null });
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

export async function deleteShoe(shoeId: number): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  try {
    const db = adminDb();
    const { error: sizesError } = await db.from("shoe_sizes").delete().eq("shoe_id", shoeId);
    if (sizesError) throw sizesError;
    const { error } = await db.from("shoes").delete().eq("id", shoeId);
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

export async function setSizeStock(sizeId: number, stock: string): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  let n: number;
  try {
    n = parseCount(stock, "Stock");
  } catch (e) {
    return fail(toError(e));
  }
  if (n < 0) return fail("Stock cannot be negative");
  try {
    const { error } = await adminDb().from("shoe_sizes").update({ stock: n }).eq("id", sizeId);
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

export async function addShoeSize(
  shoeId: number,
  size: string,
  stock: string,
): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  let sizeNum: number;
  let stockNum: number;
  try {
    sizeNum = parseCount(size, "Size");
    stockNum = parseCount(stock, "Stock");
  } catch (e) {
    return fail(toError(e));
  }
  if (sizeNum < 39 || sizeNum > 45) return fail("Size must be between 39 and 45");
  if (stockNum < 0) return fail("Stock cannot be negative");
  try {
    const db = adminDb();
    const { data: existing, error: lookupError } = await db
      .from("shoe_sizes")
      .select("id")
      .eq("shoe_id", shoeId)
      .eq("size", sizeNum)
      .limit(1);
    if (lookupError) throw lookupError;
    if (existing && existing.length > 0) return fail("That size already exists for this shoe");
    const { error } = await db
      .from("shoe_sizes")
      .insert({ shoe_id: shoeId, size: sizeNum, stock: stockNum });
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

export async function deleteShoeSize(sizeId: number): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  try {
    const { error } = await adminDb().from("shoe_sizes").delete().eq("id", sizeId);
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadShoeImage(
  itemNumber: number,
  variant: string,
  formData: FormData,
): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  if (!(IMAGE_VARIANTS as readonly string[]).includes(variant)) return fail("Unknown variant");
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return fail("No image selected");
  if (file.size > MAX_IMAGE_BYTES) return fail("Image must be 5 MB or smaller");
  const bytes = Buffer.from(await file.arrayBuffer());
  const isWebp =
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("binary") === "RIFF" &&
    bytes.subarray(8, 12).toString("binary") === "WEBP";
  if (!isWebp) return fail("Image must be a WebP file");
  try {
    const { error } = await adminDb()
      .storage.from("assets")
      .upload(`item-${itemNumber}-${variant}.webp`, bytes, {
        contentType: "image/webp",
        upsert: true,
      });
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

export async function deleteShoeImage(
  itemNumber: number,
  variant: string,
): Promise<AdminResult> {
  const denied = await assertAdmin();
  if (denied) return fail(denied);
  if (!(IMAGE_VARIANTS as readonly string[]).includes(variant)) return fail("Unknown variant");
  try {
    const { error } = await adminDb()
      .storage.from("assets")
      .remove([`item-${itemNumber}-${variant}.webp`]);
    if (error) throw error;
    revalidatePath("/admin");
    return done();
  } catch (e) {
    return fail(toError(e));
  }
}

// Server-only: lists product photos from the storage bucket.
// Import only from server components, server actions, or lib/queries.
import { createClient } from "@supabase/supabase-js";

const IMAGE_PATTERN = /^item-(\d+)-(.+)\.(png|webp|jpe?g)$/;
const CANONICAL_ORDER = ["main", "standard", "worn", "top"];
const EXT_RANK: Record<string, number> = { png: 0, webp: 1, jpg: 2, jpeg: 2 };

function imageRank(name: string): [number, number, number, string] {
  const match = IMAGE_PATTERN.exec(name);
  const variant = match?.[2] ?? "";
  const ext = match?.[3] ?? "";
  const order = CANONICAL_ORDER.indexOf(variant);
  // Canonical variants first (png before webp), then anything else by name.
  // Existing bucket files and admin uploads share this ordering, so both
  // appear in one gallery with the main photo first.
  return order === -1
    ? [1, 0, 0, name]
    : [0, order, EXT_RANK[ext] ?? 3, name];
}

function compareImages(a: string, b: string): number {
  const [a0, a1, a2, a3] = imageRank(a);
  const [b0, b1, b2, b3] = imageRank(b);
  if (a0 !== b0) return a0 - b0;
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 < b3 ? -1 : a3 > b3 ? 1 : 0;
}

/** Map of item number to ordered photo filenames. One bucket listing total. */
export async function listShoeImagesByItem(): Promise<Record<number, string[]>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Admin database access is not configured");
  const db = createClient(url, key);
  const { data, error } = await db.storage.from("assets").list("", { limit: 1000 });
  if (error) throw error;
  const byItem: Record<number, string[]> = {};
  for (const entry of data ?? []) {
    const match = IMAGE_PATTERN.exec(entry.name);
    if (!match) continue;
    const item = Number(match[1]);
    (byItem[item] ??= []).push(entry.name);
  }
  for (const item of Object.keys(byItem)) byItem[Number(item)].sort(compareImages);
  return byItem;
}

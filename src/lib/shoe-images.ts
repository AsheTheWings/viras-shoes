// Server-only: lists product photos from the storage bucket.
// Import only from server components, server actions, or lib/queries.
import { createClient } from "@supabase/supabase-js";
import type { GalleryImage } from "./types";

const IMAGE_PATTERN = /^item-(\d+)-([A-Za-z0-9-]+)\.(png|webp|jpe?g)$/;
const CANONICAL_ORDER = ["main", "standard", "worn", "top"];
const EXT_RANK: Record<string, number> = { webp: 0, png: 1, jpg: 2, jpeg: 2 };

function stemRank(stem: string): [number, string] {
  const variant = stem.replace(/^item-\d+-/, "");
  const order = CANONICAL_ORDER.indexOf(variant);
  // Canonical variants first, then anything else by name. Existing bucket
  // files and admin uploads share this ordering, so both appear in one
  // gallery with the main photo first.
  return order === -1 ? [1, stem] : [0, String(order).padStart(2, "0")];
}

function compareStems(a: string, b: string): number {
  const [a0, a1] = stemRank(a);
  const [b0, b1] = stemRank(b);
  if (a0 !== b0) return a0 - b0;
  return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
}

function preferDisplay(files: string[]): string {
  return [...files].sort((a, b) => {
    const ext = (n: string) => n.slice(n.lastIndexOf(".") + 1);
    return (EXT_RANK[ext(a)] ?? 3) - (EXT_RANK[ext(b)] ?? 3);
  })[0];
}

function preferHero(files: string[], display: string): string {
  return files.find((f) => f.toLowerCase().endsWith(".png")) ?? display;
}

/** Map of item number to ordered photos. One bucket listing total. */
export async function listShoeImagesByItem(): Promise<Record<number, GalleryImage[]>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Admin database access is not configured");
  const db = createClient(url, key);
  const { data, error } = await db.storage.from("assets").list("", { limit: 1000 });
  if (error) throw error;
  const stems = new Map<string, { item: number; files: string[] }>();
  for (const entry of data ?? []) {
    const match = IMAGE_PATTERN.exec(entry.name);
    if (!match) continue;
    const item = Number(match[1]);
    const stem = entry.name.slice(0, entry.name.lastIndexOf("."));
    const group = stems.get(stem) ?? { item, files: [] };
    group.files.push(entry.name);
    stems.set(stem, group);
  }
  const byItem: Record<number, GalleryImage[]> = {};
  const ordered = [...stems.entries()].sort(([a], [b]) => compareStems(a, b));
  for (const [stem, { item, files }] of ordered) {
    const file = preferDisplay(files);
    (byItem[item] ??= []).push({ stem, file, heroFile: preferHero(files, file) });
  }
  return byItem;
}

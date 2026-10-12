// Server-only: product photos and site settings in the storage bucket.
// Import only from server components, server actions, or lib/queries.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { groupGallery } from "./photo-sides";
import { parseSiteSettings, type SiteSettings } from "./social";
import type { GalleryImage } from "./types";

export const SETTINGS_PATH = "settings/site.json";

export function serviceDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Admin database access is not configured");
  return createClient(url, key);
}

/** Every filename at the bucket root. */
export async function listAssetNames(db = serviceDb()): Promise<string[]> {
  const { data, error } = await db.storage
    .from("assets")
    .list("", { limit: 1000 });
  if (error) throw error;
  return (data ?? []).map((entry) => entry.name);
}

/** Map of item number to ordered photos. One bucket listing total. */
export async function listShoeImagesByItem(): Promise<
  Record<number, GalleryImage[]>
> {
  return groupGallery(await listAssetNames());
}

/** Stored site settings; a missing settings file means no settings yet. */
export async function readSiteSettings(
  db = serviceDb(),
): Promise<SiteSettings> {
  const { data, error } = await db.storage
    .from("assets")
    .list("settings", { search: "site.json", limit: 10 });
  if (error) throw error;
  if (!(data ?? []).some((entry) => entry.name === "site.json")) {
    return parseSiteSettings(null);
  }
  const file = await db.storage.from("assets").download(SETTINGS_PATH);
  if (file.error) throw file.error;
  return parseSiteSettings(JSON.parse(await file.data.text()));
}

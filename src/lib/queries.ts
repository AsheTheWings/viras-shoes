import { supabase } from "./supabase";
import { listShoeImagesByItem, readSiteSettings } from "./shoe-images";
import type { SocialLinks } from "./social";
import type { GalleryImage, ShoeWithSizes } from "./types";

export async function getShoes(): Promise<ShoeWithSizes[]> {
  const { data: shoes, error: shoesError } = await supabase
    .from("shoes")
    .select("*")
    .order("item_number");

  if (shoesError) throw shoesError;

  const { data: sizes, error: sizesError } = await supabase
    .from("shoe_sizes")
    .select("*")
    .order("size");

  if (sizesError) throw sizesError;

  // Photos are a progressive enhancement: the catalog still renders
  // (with placeholders) when the service key or storage is unavailable.
  let imagesByItem: Record<number, GalleryImage[]> = {};
  try {
    imagesByItem = await listShoeImagesByItem();
  } catch {
    imagesByItem = {};
  }

  return shoes.map((shoe) => ({
    ...shoe,
    sizes: sizes.filter((s) => s.shoe_id === shoe.id),
    images: imagesByItem[shoe.item_number] ?? [],
  }));
}

/** Social profiles for the shop; none when settings are unavailable. */
export async function getSocialLinks(): Promise<SocialLinks> {
  try {
    return (await readSiteSettings()).social;
  } catch {
    return {};
  }
}

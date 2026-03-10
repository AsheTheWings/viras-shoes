import { supabase } from "./supabase";
import type { ShoeWithSizes } from "./types";

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

  return shoes.map((shoe) => ({
    ...shoe,
    sizes: sizes.filter((s) => s.shoe_id === shoe.id),
  }));
}

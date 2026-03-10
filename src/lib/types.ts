export interface Shoe {
  id: number;
  item_number: number;
  name: string;
  description: string | null;
  price: number;
}

export interface ShoeSize {
  id: number;
  shoe_id: number;
  size: number;
  stock: number;
}

export interface ShoeWithSizes extends Shoe {
  sizes: ShoeSize[];
}

export type ImageVariant = "main" | "standard" | "worn" | "top";

export const IMAGE_VARIANTS: ImageVariant[] = ["main", "standard", "worn", "top"];

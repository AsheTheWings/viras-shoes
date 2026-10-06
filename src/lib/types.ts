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
  /** Ordered product photos (main photo first). */
  images: GalleryImage[];
}

/**
 * One product photo. Bucket twins that differ only by extension
 * (e.g. item-1-main.png + item-1-main.webp) collapse into a single
 * entry: `file` is the lightweight display file, `heroFile` the
 * full-quality file for large views.
 */
export interface GalleryImage {
  stem: string;
  file: string;
  heroFile: string;
}

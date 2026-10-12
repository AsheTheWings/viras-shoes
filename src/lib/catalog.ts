import type { ShoeWithSizes } from "./types";

export type CatalogSort = "featured" | "price-asc" | "price-desc" | "name";

export function availableSizes(shoe: ShoeWithSizes): number[] {
  return shoe.sizes
    .filter((row) => row.stock > 0)
    .map((row) => row.size)
    .sort((a, b) => a - b);
}

export function filterCatalog(
  shoes: ShoeWithSizes[],
  options: {
    query: string;
    size: number | null;
    sort: CatalogSort;
    favoritesOnly: boolean;
    favorites: number[];
  },
): ShoeWithSizes[] {
  const query = options.query.trim().toLocaleLowerCase();
  const result = shoes.filter(
    (shoe) =>
      (!query ||
        `${shoe.name} ${shoe.description ?? ""}`
          .toLocaleLowerCase()
          .includes(query)) &&
      (options.size === null || availableSizes(shoe).includes(options.size)) &&
      (!options.favoritesOnly || options.favorites.includes(shoe.id)),
  );
  return result.sort((a, b) => {
    if (options.sort === "price-asc")
      return a.price - b.price || a.item_number - b.item_number;
    if (options.sort === "price-desc")
      return b.price - a.price || a.item_number - b.item_number;
    if (options.sort === "name") return a.name.localeCompare(b.name);
    return a.item_number - b.item_number;
  });
}

export function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(
    locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-MA" : "en-GB",
    {
      style: "currency",
      currency: "MAD",
      maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
    },
  ).format(price);
}

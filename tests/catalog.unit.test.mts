import assert from "node:assert/strict";
import { test } from "node:test";
import {
  availableSizes,
  filterCatalog,
  formatPrice,
} from "../src/lib/catalog.ts";
import type { ShoeWithSizes } from "../src/lib/types.ts";

const shoes: ShoeWithSizes[] = [
  {
    id: 1,
    item_number: 1,
    name: "Classic",
    description: "Leather loafer",
    price: 249,
    images: [],
    sizes: [
      { id: 1, shoe_id: 1, size: 41, stock: 2 },
      { id: 2, shoe_id: 1, size: 42, stock: 0 },
    ],
  },
  {
    id: 2,
    item_number: 2,
    name: "Minimal",
    description: null,
    price: 199,
    images: [],
    sizes: [{ id: 3, shoe_id: 2, size: 42, stock: 3 }],
  },
  {
    id: 3,
    item_number: 3,
    name: "Sold out",
    description: null,
    price: 99,
    images: [],
    sizes: [],
  },
];
const defaults = {
  query: "",
  size: null,
  sort: "featured" as const,
  favoritesOnly: false,
  favorites: [],
};

test("unit: catalog search, available sizes and saved pairs intersect", () => {
  assert.deepEqual(availableSizes(shoes[0]), [41]);
  assert.deepEqual(
    filterCatalog(shoes, {
      ...defaults,
      query: " LEATHER ",
      size: 41,
      favoritesOnly: true,
      favorites: [1],
    }).map((shoe) => shoe.id),
    [1],
  );
  assert.equal(
    filterCatalog(shoes, { ...defaults, query: "leather", size: 42 }).length,
    0,
  );
  assert.equal(
    filterCatalog(shoes, { ...defaults, favoritesOnly: true }).length,
    0,
  );
  assert.equal(filterCatalog([], defaults).length, 0);
});

test("unit: sorting preserves catalog input and prices keep fractional amounts", () => {
  assert.deepEqual(
    filterCatalog(shoes, { ...defaults, sort: "price-asc" }).map(
      (shoe) => shoe.id,
    ),
    [3, 2, 1],
  );
  assert.deepEqual(
    filterCatalog(shoes, { ...defaults, sort: "price-desc" }).map(
      (shoe) => shoe.id,
    ),
    [1, 2, 3],
  );
  assert.deepEqual(
    shoes.map((shoe) => shoe.id),
    [1, 2, 3],
  );
  assert.match(formatPrice(199.5, "en"), /199\.50/);
});

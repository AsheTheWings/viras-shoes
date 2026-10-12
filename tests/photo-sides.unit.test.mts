import assert from "node:assert/strict";
import { test } from "node:test";
import { groupGallery, parseStem, uploadFilename } from "../src/lib/photo-sides.ts";

test("unit: legacy and versioned side names parse to their side", () => {
  assert.deepEqual(parseStem("item-3-main"), { item: 3, side: "main", version: "" });
  assert.deepEqual(parseStem("item-3-sole-vmgx1abc"), { item: 3, side: "sole", version: "mgx1abc" });
  assert.equal(parseStem("item-3-mgx1a0-0f0f0f")?.side, null);
  assert.equal(parseStem("item-3-x123")?.side, null);
  assert.equal(parseStem("../item-3-main"), null);
  assert.equal(uploadFilename(4, "back", "abc"), "item-4-back-vabc.webp");
  assert.equal(uploadFilename(4, null, "abc"), "item-4-xabc.webp");
});

test("unit: galleries order sides first, collapse twins, and keep the newest side", () => {
  const gallery = groupGallery([
    "item-1-worn.png",
    "item-1-worn.webp",
    "item-1-xb.webp",
    "item-1-main.png",
    "item-1-main.webp",
    "item-1-main-vb.webp",
    "item-1-front-va.webp",
    "item-2-top.webp",
    "notes.txt",
  ]);
  assert.deepEqual(
    gallery[1].map((img) => [img.side, img.stem]),
    [
      ["main", "item-1-main-vb"],
      ["front", "item-1-front-va"],
      ["worn", "item-1-worn"],
      [null, "item-1-main"],
      [null, "item-1-xb"],
    ],
  );
  const worn = gallery[1][2];
  assert.equal(worn.file, "item-1-worn.webp");
  assert.equal(worn.heroFile, "item-1-worn.png");
  assert.deepEqual(Object.keys(gallery), ["1", "2"]);
});

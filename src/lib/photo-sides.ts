// Pure photo naming and grouping rules shared by the shop, the admin, and
// the storage listing. Safe to import from client components.
import type { GalleryImage, PhotoSide } from "./types";

/**
 * Angles a pair can be photographed from, in gallery order. `main` is the
 * outer side profile and `standard` the angled view of both shoes.
 */
export const PHOTO_SIDES = [
  "main",
  "standard",
  "front",
  "back",
  "inner",
  "top",
  "sole",
  "worn",
] as const satisfies readonly PhotoSide[];

const IMAGE_PATTERN = /^item-(\d+)-([A-Za-z0-9-]+)\.(png|webp|jpe?g)$/;
const EXT_RANK: Record<string, number> = { webp: 0, png: 1, jpg: 2, jpeg: 2 };

export function isPhotoSide(value: string): value is PhotoSide {
  return (PHOTO_SIDES as readonly string[]).includes(value);
}

/**
 * Side photos are named `item-<n>-<side>` or `item-<n>-<side>-v<token>`;
 * any other variant is an additional photo.
 */
export function parseStem(
  stem: string,
): { item: number; side: PhotoSide | null; version: string } | null {
  const match = /^item-(\d+)-([A-Za-z0-9-]+)$/.exec(stem);
  if (!match) return null;
  const item = Number(match[1]);
  const variant = match[2];
  const dash = variant.indexOf("-");
  const head = dash === -1 ? variant : variant.slice(0, dash);
  const rest = dash === -1 ? "" : variant.slice(dash + 1);
  if (isPhotoSide(head) && (rest === "" || /^v[a-z0-9]+$/.test(rest))) {
    return { item, side: head, version: rest.slice(1) };
  }
  return { item, side: null, version: "" };
}

/** Storage filename for a new upload; the token keeps every URL immutable. */
export function uploadFilename(
  itemNumber: number,
  side: PhotoSide | null,
  token: string,
): string {
  return side
    ? `item-${itemNumber}-${side}-v${token}.webp`
    : `item-${itemNumber}-x${token}.webp`;
}

function preferDisplay(files: string[]): string {
  const ext = (n: string) => n.slice(n.lastIndexOf(".") + 1).toLowerCase();
  return [...files].sort(
    (a, b) => (EXT_RANK[ext(a)] ?? 3) - (EXT_RANK[ext(b)] ?? 3),
  )[0];
}

function preferHero(files: string[], display: string): string {
  return files.find((f) => f.toLowerCase().endsWith(".png")) ?? display;
}

/**
 * Groups bucket filenames into ordered galleries keyed by item number.
 * Files sharing a stem collapse into one photo. Each side keeps its newest
 * upload; older duplicates of a side are listed as additional photos.
 */
export function groupGallery(names: string[]): Record<number, GalleryImage[]> {
  const stems = new Map<string, string[]>();
  for (const name of names) {
    if (!IMAGE_PATTERN.test(name)) continue;
    const stem = name.slice(0, name.lastIndexOf("."));
    stems.set(stem, [...(stems.get(stem) ?? []), name]);
  }
  type Candidate = { stem: string; version: string };
  type ItemPhotos = { sides: Map<PhotoSide, Candidate[]>; extras: string[] };
  const byItem = new Map<number, ItemPhotos>();
  for (const stem of stems.keys()) {
    const parsed = parseStem(stem);
    if (!parsed) continue;
    const entry: ItemPhotos = byItem.get(parsed.item) ?? {
      sides: new Map(),
      extras: [],
    };
    if (parsed.side) {
      const list = entry.sides.get(parsed.side) ?? [];
      list.push({ stem, version: parsed.version });
      entry.sides.set(parsed.side, list);
    } else {
      entry.extras.push(stem);
    }
    byItem.set(parsed.item, entry);
  }
  const toImage = (stem: string, side: PhotoSide | null): GalleryImage => {
    const files = stems.get(stem)!;
    const file = preferDisplay(files);
    return { stem, side, file, heroFile: preferHero(files, file) };
  };
  const result: Record<number, GalleryImage[]> = {};
  for (const [item, { sides, extras }] of byItem) {
    const images: GalleryImage[] = [];
    const extraStems = [...extras];
    for (const side of PHOTO_SIDES) {
      const candidates = sides.get(side);
      if (!candidates) continue;
      // Newest version first; legacy unversioned names sort last.
      candidates.sort((a, b) =>
        a.version < b.version ? 1 : a.version > b.version ? -1 : 0,
      );
      images.push(toImage(candidates[0].stem, side));
      extraStems.push(...candidates.slice(1).map((c) => c.stem));
    }
    extraStems.sort();
    images.push(...extraStems.map((stem) => toImage(stem, null)));
    result[item] = images;
  }
  return result;
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/catalog";
import { assetUrl } from "@/lib/supabase";
import { PHOTO_SIDES } from "@/lib/photo-sides";
import type { AdminResult } from "@/lib/admin-errors";
import type { GalleryImage, PhotoSide, Shoe, ShoeSize } from "@/lib/types";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";
import {
  addShoeSize,
  createShoe,
  deleteShoe,
  deleteShoeImage,
  deleteShoeSize,
  setSizeStock,
  updateShoe,
  uploadShoePhoto,
} from "./actions";
import { useAdminAction } from "./use-admin-action";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

const sideLabel = (side: PhotoSide, locale: Locale) =>
  t(`photo.side.${side}` as TranslationKey, locale);

const textareaClass =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm";

/** Uploads files one request at a time; stops at the first failure. */
async function uploadAll(
  itemNumber: number,
  side: PhotoSide | null,
  files: File[],
  onProgress?: (done: number) => void,
): Promise<AdminResult> {
  for (const [index, file] of files.entries()) {
    if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "image_too_large" };
    const fd = new FormData();
    fd.append("image", file);
    const res = await uploadShoePhoto(itemNumber, side, fd);
    if (!res.ok) return res;
    onProgress?.(index + 1);
  }
  return { ok: true };
}

function DeletePhotoButton({
  pending,
  onConfirm,
  locale,
}: {
  pending: boolean;
  onConfirm: () => void;
  locale: Locale;
}) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <span className="inline-flex gap-1">
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
        >
          {t("admin.orders.confirm", locale)}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          {t("admin.orders.keep", locale)}
        </Button>
      </span>
    );
  }
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      disabled={pending}
      onClick={() => setConfirming(true)}
      aria-label={t("admin.shoes.delete", locale)}
      title={t("admin.shoes.delete", locale)}
    >
      <Trash2 />
    </Button>
  );
}

function Thumb({ image, alt }: { image: GalleryImage; alt: string }) {
  return (
    <Image
      src={assetUrl(image.file)}
      alt={alt}
      fill
      sizes="160px"
      className="object-contain"
    />
  );
}

function SideSlot({
  itemNumber,
  side,
  image,
  cover,
  locale,
}: {
  itemNumber: number;
  side: PhotoSide;
  image: GalleryImage | undefined;
  cover: boolean;
  locale: Locale;
}) {
  const { pending, error, run } = useAdminAction(locale);
  const input = useRef<HTMLInputElement>(null);
  const label = sideLabel(side, locale);

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-neutral-50 p-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white">
        {image ? (
          <Thumb image={image} alt={label} />
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => input.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600"
          >
            <ImagePlus className="size-6" />
            <span className="text-[11px]">{t("admin.shoes.emptySide", locale)}</span>
          </button>
        )}
        {cover ? (
          <span className="absolute start-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-neutral-900/80 px-1.5 py-0.5 text-[10px] text-white">
            <Star className="size-2.5" /> {t("admin.shoes.firstPhoto", locale)}
          </span>
        ) : null}
        {pending ? (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium">
            {t("admin.shoes.uploading", locale)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 truncate text-xs font-medium" title={label}>{label}</p>
      <div className="mt-2 flex items-center gap-1">
        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-label={`${t("admin.shoes.choosePhoto", locale)} — ${label}`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) run(() => uploadAll(itemNumber, side, [file]));
          }}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => input.current?.click()}
          className="min-w-0 flex-1"
          aria-label={`${t(image ? "admin.shoes.replacePhoto" : "admin.shoes.choosePhoto", locale)} — ${label}`}
        >
          <Upload />
          <span className="truncate">
            {t(image ? "admin.shoes.replacePhoto" : "admin.shoes.choosePhoto", locale)}
          </span>
        </Button>
        {image ? (
          <DeletePhotoButton
            pending={pending}
            locale={locale}
            onConfirm={() => run(() => deleteShoeImage(itemNumber, image.stem))}
          />
        ) : null}
      </div>
      {error ? <p role="alert" className="mt-1 text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

function ExtraPhoto({
  itemNumber,
  image,
  index,
  cover,
  locale,
}: {
  itemNumber: number;
  image: GalleryImage;
  index: number;
  cover: boolean;
  locale: Locale;
}) {
  const { pending, error, run } = useAdminAction(locale);
  const alt = `${t("admin.shoes.extraPhotos", locale)} ${index + 1}`;
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">
      <div className="relative aspect-square overflow-hidden rounded-md bg-white">
        <Thumb image={image} alt={alt} />
        {cover ? (
          <span className="absolute start-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-neutral-900/80 px-1.5 py-0.5 text-[10px] text-white">
            <Star className="size-2.5" /> {t("admin.shoes.firstPhoto", locale)}
          </span>
        ) : null}
      </div>
      <div className="mt-1 flex items-center justify-between gap-1">
        <span className="text-xs text-neutral-500">{index + 1}</span>
        <DeletePhotoButton
          pending={pending}
          locale={locale}
          onConfirm={() => run(() => deleteShoeImage(itemNumber, image.stem))}
        />
      </div>
      {error ? <p role="alert" className="mt-1 text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

function PhotosManager({
  itemNumber,
  images,
  locale,
}: {
  itemNumber: number;
  images: GalleryImage[];
  locale: Locale;
}) {
  const { pending, error, run } = useAdminAction(locale);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const bySide = new Map(images.flatMap((img) => (img.side ? [[img.side, img] as const] : [])));
  const extras = images.filter((img) => !img.side);
  const coverStem = images[0]?.stem;

  return (
    <div>
      <p className="text-xs text-neutral-500">{t("admin.shoes.sidesHint", locale)}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {PHOTO_SIDES.map((side) => (
          <SideSlot
            key={side}
            itemNumber={itemNumber}
            side={side}
            image={bySide.get(side)}
            cover={bySide.get(side)?.stem === coverStem}
            locale={locale}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold">{t("admin.shoes.extraPhotos", locale)}</h4>
        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label={t("admin.shoes.addPhotos", locale)}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length === 0) return;
            setProgress({ done: 0, total: files.length });
            run(
              () =>
                uploadAll(itemNumber, null, files, (done) =>
                  setProgress({ done, total: files.length }),
                ),
              () => setProgress(null),
            );
          }}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => input.current?.click()}
        >
          <ImagePlus />
          {pending ? t("admin.shoes.uploading", locale) : t("admin.shoes.addPhotos", locale)}
        </Button>
        {pending && progress ? (
          <span className="text-xs text-neutral-500" aria-live="polite">
            {t("admin.shoes.uploadedCount", locale)} {progress.done}/{progress.total}
          </span>
        ) : null}
      </div>
      {error ? <p role="alert" className="mt-1 text-xs text-red-600">{error}</p> : null}
      {extras.length === 0 ? (
        <p className="py-2 text-sm text-neutral-500">{t("admin.shoes.noExtras", locale)}</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {extras.map((image, index) => (
            <ExtraPhoto
              key={image.stem}
              itemNumber={itemNumber}
              image={image}
              index={index}
              cover={image.stem === coverStem}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SizeRow({ row, locale }: { row: ShoeSize; locale: Locale }) {
  const { pending, error, run } = useAdminAction(locale);
  const [stock, setStock] = useState(String(row.stock));
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <span className="w-14 text-sm font-medium" dir="ltr">EU {row.size}</span>
      <Input
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        disabled={pending}
        inputMode="numeric"
        className="h-8 w-24"
        aria-label={`${t("admin.shoes.stockLabel", locale)} EU ${row.size}`}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={pending || stock === String(row.stock)}
        onClick={() => run(() => setSizeStock(row.id, stock))}
      >
        {t("admin.shoes.save", locale)}
      </Button>
      {confirming ? (
        <span className="inline-flex gap-1.5">
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => run(() => deleteShoeSize(row.id))}
          >
            {t("admin.orders.confirm", locale)}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
            {t("admin.orders.keep", locale)}
          </Button>
        </span>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
          {t("admin.shoes.remove", locale)}
        </Button>
      )}
      {error ? <span role="alert" className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

function AddSizeForm({ shoeId, locale }: { shoeId: number; locale: Locale }) {
  const { pending, error, run } = useAdminAction(locale);
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("0");
  const id = `shoe-${shoeId}-new`;
  return (
    <>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-size`}>{t("admin.shoes.sizeLabel", locale)}</Label>
          <Input
            id={`${id}-size`}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            inputMode="numeric"
            className="h-8 w-24"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-stock`}>{t("admin.shoes.stockLabel", locale)}</Label>
          <Input
            id={`${id}-stock`}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            inputMode="numeric"
            className="h-8 w-24"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || size.trim() === ""}
          onClick={() =>
            run(
              () => addShoeSize(shoeId, size, stock),
              () => {
                setSize("");
                setStock("0");
              },
            )
          }
        >
          {t("admin.shoes.addSize", locale)}
        </Button>
      </div>
      {error ? <p role="alert" className="mt-1 text-xs text-red-600">{error}</p> : null}
    </>
  );
}

function ShoeCard({
  shoe,
  sizes,
  images,
  locale,
}: {
  shoe: Shoe;
  sizes: ShoeSize[];
  images: GalleryImage[];
  locale: Locale;
}) {
  const details = useAdminAction(locale);
  const removal = useAdminAction(locale);
  const [name, setName] = useState(shoe.name);
  const [price, setPrice] = useState(String(shoe.price));
  const [description, setDescription] = useState(shoe.description ?? "");
  const [savedNote, setSavedNote] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const dirty =
    name !== shoe.name ||
    price !== String(shoe.price) ||
    description !== (shoe.description ?? "");
  const units = sizes.reduce((total, row) => total + Math.max(0, row.stock), 0);
  const id = `shoe-${shoe.id}`;

  return (
    <details className="group rounded-lg border border-neutral-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
          {images[0] ? <Thumb image={images[0]} alt="" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">
            #{shoe.item_number} · {shoe.name}
          </span>
          <span className="block text-xs text-neutral-500">
            <span dir="ltr">{formatPrice(shoe.price, locale)}</span> ·{" "}
            {t("admin.units", locale)}: {units} · {t("admin.shoes.photos", locale)}:{" "}
            {images.length}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-neutral-200 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-name`}>{t("admin.shoes.name", locale)}</Label>
            <Input
              id={`${id}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={details.pending}
              dir="auto"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-price`}>{t("admin.shoes.price", locale)}</Label>
            <Input
              id={`${id}-price`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={details.pending}
              inputMode="decimal"
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-item`}>{t("admin.shoes.itemNumberHint", locale)}</Label>
            <Input id={`${id}-item`} value={shoe.item_number} disabled readOnly dir="ltr" />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor={`${id}-description`}>{t("admin.shoes.description", locale)}</Label>
          <textarea
            id={`${id}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={details.pending}
            dir="auto"
            maxLength={2000}
            className={textareaClass}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button
            size="sm"
            disabled={details.pending || !dirty}
            onClick={() => {
              setSavedNote(false);
              details.run(
                () => updateShoe(shoe.id, { name, price, description }),
                () => setSavedNote(true),
              );
            }}
          >
            {t("admin.shoes.saveDetails", locale)}
          </Button>
          {savedNote && !dirty ? (
            <span className="text-xs text-emerald-700" role="status">
              {t("admin.saved", locale)}
            </span>
          ) : null}
        </div>
        {details.error ? (
          <p role="alert" className="mt-2 text-xs text-red-600">{details.error}</p>
        ) : null}

        <Separator className="my-4" />

        <h3 className="text-sm font-semibold">{t("admin.shoes.sides", locale)}</h3>
        <PhotosManager itemNumber={shoe.item_number} images={images} locale={locale} />

        <Separator className="my-4" />

        <h3 className="text-sm font-semibold">{t("admin.shoes.sizes", locale)}</h3>
        <div className="mt-1 divide-y divide-neutral-100">
          {sizes.length === 0 ? (
            <p className="py-2 text-sm text-neutral-500">{t("admin.shoes.noSizes", locale)}</p>
          ) : null}
          {sizes.map((s) => (
            <SizeRow key={s.id} row={s} locale={locale} />
          ))}
        </div>
        <AddSizeForm shoeId={shoe.id} locale={locale} />

        <Separator className="my-4" />

        <div className="flex flex-wrap items-center gap-3">
          {confirmingDelete ? (
            <span className="inline-flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                disabled={removal.pending}
                onClick={() => removal.run(() => deleteShoe(shoe.id))}
              >
                {t("admin.shoes.confirmDelete", locale)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)}>
                {t("admin.orders.keep", locale)}
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(true)}>
              {t("admin.shoes.deleteShoe", locale)}
            </Button>
          )}
          <span className="text-xs text-neutral-500">{t("admin.shoes.deleteShoeHint", locale)}</span>
        </div>
        {removal.error ? (
          <p role="alert" className="mt-2 text-xs text-red-600">{removal.error}</p>
        ) : null}
      </div>
    </details>
  );
}

function AddShoeForm({ locale }: { locale: Locale }) {
  const { pending, error, run } = useAdminAction(locale);
  const [open, setOpen] = useState(false);
  const [itemNumber, setItemNumber] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        {t("admin.shoes.add", locale)}
      </Button>
    );
  }
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="font-semibold">{t("admin.shoes.new", locale)}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-shoe-item">{t("admin.shoes.itemNumber", locale)}</Label>
          <Input
            id="new-shoe-item"
            value={itemNumber}
            onChange={(e) => setItemNumber(e.target.value)}
            inputMode="numeric"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-shoe-name">{t("admin.shoes.name", locale)}</Label>
          <Input id="new-shoe-name" value={name} onChange={(e) => setName(e.target.value)} dir="auto" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-shoe-price">{t("admin.shoes.price", locale)}</Label>
          <Input
            id="new-shoe-price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            dir="ltr"
          />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <Label htmlFor="new-shoe-description">{t("admin.shoes.description", locale)}</Label>
        <textarea
          id="new-shoe-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          dir="auto"
          className={textareaClass}
        />
      </div>
      {error ? <p role="alert" className="mt-2 text-xs text-red-600">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            run(
              () => createShoe({ itemNumber, name, price, description }),
              () => {
                setOpen(false);
                setItemNumber("");
                setName("");
                setPrice("");
                setDescription("");
              },
            )
          }
        >
          {t("admin.shoes.create", locale)}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
          {t("admin.shoes.cancel", locale)}
        </Button>
      </div>
    </div>
  );
}

export function ShoesSection({
  shoes,
  sizes,
  imagesByItem,
  locale,
}: {
  shoes: Shoe[];
  sizes: ShoeSize[];
  imagesByItem: Record<number, GalleryImage[]>;
  locale: Locale;
}) {
  const byShoe = new Map<number, ShoeSize[]>();
  for (const s of sizes) {
    const list = byShoe.get(s.shoe_id) ?? [];
    list.push(s);
    byShoe.set(s.shoe_id, list);
  }
  return (
    <div className="space-y-3">
      <AddShoeForm locale={locale} />
      {shoes.map((shoe) => (
        <ShoeCard
          key={shoe.id}
          shoe={shoe}
          sizes={byShoe.get(shoe.id) ?? []}
          images={imagesByItem[shoe.item_number] ?? []}
          locale={locale}
        />
      ))}
    </div>
  );
}

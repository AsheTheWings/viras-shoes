"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { assetUrl } from "@/lib/supabase";
import { type Shoe, type ShoeSize } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import {
  addShoeSize,
  createShoe,
  deleteShoe,
  deleteShoeImage,
  deleteShoeSize,
  setSizeStock,
  updateShoe,
  uploadShoeImages,
  type AdminResult,
} from "./actions";

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function run(action: Promise<AdminResult>, onOk?: () => void) {
    setError(null);
    start(async () => {
      const res = await action;
      if (res.ok) {
        onOk?.();
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }
  return { pending, error, run };
}

function PhotoItem({
  itemNumber,
  filename,
  locale,
}: {
  itemNumber: number;
  filename: string;
  locale: Locale;
}) {
  const { pending, error, run } = useAction();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-md border border-neutral-200 p-2">
      <Image
        src={assetUrl(filename)}
        alt={filename}
        width={64}
        height={64}
        className="h-16 w-16 rounded object-cover bg-neutral-100"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[11px] text-neutral-500">
          {filename}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {confirming ? (
            <span className="inline-flex gap-1.5">
              <Button
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() => run(deleteShoeImage(itemNumber, filename))}
              >
                {t("admin.orders.confirm", locale)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                {t("admin.orders.keep", locale)}
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
              {t("admin.shoes.delete", locale)}
            </Button>
          )}
        </div>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function PhotosManager({
  itemNumber,
  images,
  locale,
}: {
  itemNumber: number;
  images: string[];
  locale: Locale;
}) {
  const { pending, error, run } = useAction();
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState(0);
  const [inputKey, setInputKey] = useState(0);

  return (
    <div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          key={inputKey}
          ref={inputRef}
          type="file"
          accept="image/webp"
          multiple
          disabled={pending}
          onChange={(e) => setPicked(e.target.files?.length ?? 0)}
          className="max-w-52 text-xs"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={pending || picked === 0}
          onClick={() => {
            const files = inputRef.current?.files;
            if (!files || files.length === 0) return;
            const fd = new FormData();
            for (const file of files) fd.append("images", file);
            run(uploadShoeImages(itemNumber, fd), () => {
              setPicked(0);
              setInputKey((k) => k + 1);
            });
          }}
        >
          {pending ? t("admin.shoes.uploading", locale) : t("admin.shoes.addPhotos", locale)}
        </Button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {images.length === 0 ? (
        <p className="py-2 text-sm text-neutral-500">{t("admin.shoes.noPhotos", locale)}</p>
      ) : (
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {images.map((filename) => (
            <PhotoItem key={filename} itemNumber={itemNumber} filename={filename} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function SizeRow({ row, locale }: { row: ShoeSize; locale: Locale }) {
  const { pending, error, run } = useAction();
  const [stock, setStock] = useState(String(row.stock));
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-10 text-sm font-medium" dir="ltr">EU {row.size}</span>
      <Input
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        disabled={pending}
        inputMode="numeric"
        className="h-8 w-24"
        aria-label={`${t("admin.shoes.stockLabel", locale)} ${row.size}`}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={pending || stock === String(row.stock)}
        onClick={() => run(setSizeStock(row.id, stock))}
      >
        {t("admin.shoes.save", locale)}
      </Button>
      {confirming ? (
        <span className="inline-flex gap-1.5">
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => run(deleteShoeSize(row.id))}>
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
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
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
  images: string[];
  locale: Locale;
}) {
  const { pending, error, run } = useAction();
  const [name, setName] = useState(shoe.name);
  const [price, setPrice] = useState(String(shoe.price));
  const [description, setDescription] = useState(shoe.description ?? "");
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("0");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const dirty =
    name !== shoe.name || price !== String(shoe.price) || description !== (shoe.description ?? "");

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">
          #{shoe.item_number} · {shoe.name}
        </h2>
        {confirmingDelete ? (
          <span className="inline-flex gap-2">
            <Button size="sm" variant="destructive" disabled={pending} onClick={() => run(deleteShoe(shoe.id))}>
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
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>{t("admin.shoes.name", locale)}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={pending} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("admin.shoes.price", locale)}</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} disabled={pending} inputMode="decimal" />
        </div>
        <div className="space-y-1.5 sm:col-span-1">
          <Label>{t("admin.shoes.itemNumberHint", locale)}</Label>
          <Input value={shoe.item_number} disabled readOnly />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <Label>{t("admin.shoes.description", locale)}</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={pending} />
      </div>
      <div className="mt-3">
        <Button size="sm" disabled={pending || !dirty} onClick={() => run(updateShoe(shoe.id, { name, price, description }))}>
          {t("admin.shoes.saveDetails", locale)}
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <Separator className="my-4" />

      <h3 className="text-sm font-semibold">{t("admin.shoes.sizes", locale)}</h3>
      <div className="mt-1 divide-y divide-neutral-100">
        {sizes.length === 0 ? <p className="py-2 text-sm text-neutral-500">{t("admin.shoes.noSizes", locale)}</p> : null}
        {sizes.map((s) => (
          <SizeRow key={s.id} row={s} locale={locale} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <Label>{t("admin.shoes.sizeLabel", locale)}</Label>
          <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} inputMode="numeric" className="h-8 w-24" />
        </div>
        <div className="space-y-1.5">
          <Label>{t("admin.shoes.stockLabel", locale)}</Label>
          <Input value={newStock} onChange={(e) => setNewStock(e.target.value)} inputMode="numeric" className="h-8 w-24" />
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || newSize.trim() === ""}
          onClick={() =>
            run(addShoeSize(shoe.id, newSize, newStock), () => {
              setNewSize("");
              setNewStock("0");
            })
          }
        >
          {t("admin.shoes.addSize", locale)}
        </Button>
      </div>

      <Separator className="my-4" />

      <h3 className="text-sm font-semibold">{t("admin.shoes.photos", locale)}</h3>
      <PhotosManager itemNumber={shoe.item_number} images={images} locale={locale} />
    </section>
  );
}

function AddShoeForm({ locale }: { locale: Locale }) {
  const { pending, error, run } = useAction();
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
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label>{t("admin.shoes.itemNumber", locale)}</Label>
          <Input value={itemNumber} onChange={(e) => setItemNumber(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-1.5">
          <Label>{t("admin.shoes.name", locale)}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("admin.shoes.price", locale)}</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
        </div>
        <div className="space-y-1.5">
          <Label>{t("admin.shoes.description", locale)}</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            run(createShoe({ itemNumber, name, price, description }), () => {
              setOpen(false);
              setItemNumber("");
              setName("");
              setPrice("");
              setDescription("");
            })
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
  imagesByItem: Record<number, string[]>;
  locale: Locale;
}) {
  const byShoe = new Map<number, ShoeSize[]>();
  for (const s of sizes) {
    const list = byShoe.get(s.shoe_id) ?? [];
    list.push(s);
    byShoe.set(s.shoe_id, list);
  }
  return (
    <div className="space-y-4">
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

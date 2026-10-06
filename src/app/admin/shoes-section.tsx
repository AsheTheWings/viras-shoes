"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { assetUrl } from "@/lib/supabase";
import { IMAGE_VARIANTS, type ImageVariant, type Shoe, type ShoeSize } from "@/lib/types";
import {
  addShoeSize,
  createShoe,
  deleteShoe,
  deleteShoeImage,
  deleteShoeSize,
  setSizeStock,
  updateShoe,
  uploadShoeImage,
  type AdminResult,
} from "./actions";

const VARIANT_LABELS: Record<ImageVariant, string> = {
  main: "Front",
  standard: "Side",
  worn: "Worn",
  top: "Top",
};

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

function ImageManager({ itemNumber, variant }: { itemNumber: number; variant: ImageVariant }) {
  const { pending, error, run } = useAction();
  const [bump, setBump] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const src = `${assetUrl(`item-${itemNumber}-${variant}.webp`)}${bump ? `?v=${bump}` : ""}`;

  return (
    <div className="flex items-center gap-3 rounded-md border border-neutral-200 p-2">
      <Image src={src} alt={`${variant} image`} width={64} height={64} className="h-16 w-16 rounded object-cover bg-neutral-100" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium">{VARIANT_LABELS[variant]}</p>
        <p className="truncate font-mono text-[11px] text-neutral-500">
          item-{itemNumber}-{variant}.webp
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/webp"
            disabled={pending}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="max-w-40 text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={pending || !file}
            onClick={() => {
              if (!file) return;
              const fd = new FormData();
              fd.set("image", file);
              run(uploadShoeImage(itemNumber, variant, fd), () => {
                setFile(null);
                setBump((b) => b + 1);
              });
            }}
          >
            Upload
          </Button>
          {confirming ? (
            <span className="inline-flex gap-1.5">
              <Button
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() =>
                  run(deleteShoeImage(itemNumber, variant), () => {
                    setConfirming(false);
                    setBump((b) => b + 1);
                  })
                }
              >
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                Keep
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
              Delete
            </Button>
          )}
        </div>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function SizeRow({ row }: { row: ShoeSize }) {
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
        aria-label={`Stock for size ${row.size}`}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={pending || stock === String(row.stock)}
        onClick={() => run(setSizeStock(row.id, stock))}
      >
        Save
      </Button>
      {confirming ? (
        <span className="inline-flex gap-1.5">
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => run(deleteShoeSize(row.id))}>
            Confirm
          </Button>
          <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
            Keep
          </Button>
        </span>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
          Remove
        </Button>
      )}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

function ShoeCard({ shoe, sizes }: { shoe: Shoe; sizes: ShoeSize[] }) {
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
              Confirm delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)}>
              Keep
            </Button>
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(true)}>
            Delete shoe
          </Button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={pending} />
        </div>
        <div className="space-y-1.5">
          <Label>Price</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} disabled={pending} inputMode="decimal" />
        </div>
        <div className="space-y-1.5 sm:col-span-1">
          <Label>Item number (fixed, keys the images)</Label>
          <Input value={shoe.item_number} disabled readOnly />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={pending} />
      </div>
      <div className="mt-3">
        <Button size="sm" disabled={pending || !dirty} onClick={() => run(updateShoe(shoe.id, { name, price, description }))}>
          Save details
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <Separator className="my-4" />

      <h3 className="text-sm font-semibold">Sizes &amp; stock</h3>
      <div className="mt-1 divide-y divide-neutral-100">
        {sizes.length === 0 ? <p className="py-2 text-sm text-neutral-500">No sizes yet.</p> : null}
        {sizes.map((s) => (
          <SizeRow key={s.id} row={s} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <Label>Size (39–45)</Label>
          <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} inputMode="numeric" className="h-8 w-24" />
        </div>
        <div className="space-y-1.5">
          <Label>Stock</Label>
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
          Add size
        </Button>
      </div>

      <Separator className="my-4" />

      <h3 className="text-sm font-semibold">Images (WebP only)</h3>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {IMAGE_VARIANTS.map((v) => (
          <ImageManager key={v} itemNumber={shoe.item_number} variant={v} />
        ))}
      </div>
    </section>
  );
}

function AddShoeForm() {
  const { pending, error, run } = useAction();
  const [open, setOpen] = useState(false);
  const [itemNumber, setItemNumber] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Add shoe
      </Button>
    );
  }
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="font-semibold">New shoe</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Item number</Label>
          <Input value={itemNumber} onChange={(e) => setItemNumber(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Price</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
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
          Create
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function ShoesSection({ shoes, sizes }: { shoes: Shoe[]; sizes: ShoeSize[] }) {
  const byShoe = new Map<number, ShoeSize[]>();
  for (const s of sizes) {
    const list = byShoe.get(s.shoe_id) ?? [];
    list.push(s);
    byShoe.set(s.shoe_id, list);
  }
  return (
    <div className="space-y-4">
      <AddShoeForm />
      {shoes.map((shoe) => (
        <ShoeCard key={shoe.id} shoe={shoe} sizes={byShoe.get(shoe.id) ?? []} />
      ))}
    </div>
  );
}

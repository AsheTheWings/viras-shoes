"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ShoeWithSizes } from "@/lib/types";
import { placeOrder } from "@/app/actions";
import { CheckCircle } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

interface OrderFormProps {
  shoe: ShoeWithSizes;
  mobile?: boolean;
}

const SIZES = [39, 40, 41, 42, 43, 44, 45] as const;

export function OrderForm({ shoe, mobile }: OrderFormProps) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const sizeStock = (size: number) =>
    shoe.sizes.find((s) => s.size === size)?.stock ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize || !name.trim()) return;

    startTransition(async () => {
      const res = await placeOrder({
        shoe_id: shoe.id,
        size: selectedSize,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim(),
      });
      setResult(res);
    });
  };

  if (result?.success) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-800">
        <CheckCircle className="h-4 w-4" />
        <p className="text-sm font-medium">{t("order.placed")}</p>
      </div>
    );
  }

  return (
    <div className={mobile ? "space-y-2" : "flex items-center gap-4 py-1"}>
      {/* Size boxes */}
      <div className={mobile ? "flex gap-1.5" : "flex gap-1.5"}>
        {SIZES.map((size) => {
          const stock = sizeStock(size);
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              disabled={stock <= 0}
              onClick={() => setSelectedSize(size)}
              className={`flex items-center justify-center rounded font-medium transition-all ${
                mobile ? "h-6 flex-1 text-[10px]" : "h-9 w-9 text-xs"
              } ${
                stock <= 0
                  ? "cursor-not-allowed bg-white/10 text-white/30 line-through"
                  : isSelected
                    ? "bg-white text-black ring-2 ring-white/40 ring-offset-2 ring-offset-black"
                    : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Order Now → opens dialog */}
      <motion.span
        key={selectedSize}
        animate={selectedSize && !mobile ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={
          selectedSize && !mobile
            ? { duration: 0.9, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.2 }
        }
        className={mobile ? "block" : "inline-flex"}
      >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              disabled={!selectedSize}
              className={
                mobile
                  ? "h-9 w-full rounded text-xs font-semibold"
                  : "h-9 rounded-md px-6 text-xs font-semibold"
              }
            />
          }
        >
          {t("order.now")} — {shoe.price} MAD
        </DialogTrigger>
        <DialogContent className="p-8">
          <DialogHeader>
            <DialogTitle>
              {shoe.name} — {t("order.size")} {selectedSize}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="order-name">{t("order.name")}</Label>
              <Input
                id="order-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("order.name.placeholder")}
                required
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="order-phone">{t("order.phone")}</Label>
                <Input
                  id="order-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212..."
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="order-email">{t("order.email")}</Label>
                <Input
                  id="order-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="mt-1"
                />
              </div>
            </div>

            {result?.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}

            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="w-full"
            >
              {isPending ? t("order.placing") : `${t("order.confirm")} — ${shoe.price} MAD`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </motion.span>
    </div>
  );
}

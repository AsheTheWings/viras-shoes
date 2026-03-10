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

interface OrderFormProps {
  shoe: ShoeWithSizes;
}

const SIZES = [39, 40, 41, 42, 43, 44, 45] as const;

export function OrderForm({ shoe }: OrderFormProps) {
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
        <p className="text-sm font-medium">Order placed!</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 py-1">
      {/* Size boxes */}
      <div className="flex gap-1.5">
        {SIZES.map((size) => {
          const stock = sizeStock(size);
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              disabled={stock <= 0}
              onClick={() => setSelectedSize(size)}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-medium transition-all ${
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
        animate={selectedSize ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={
          selectedSize
            ? { duration: 0.9, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.2 }
        }
        className="inline-flex"
      >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              disabled={!selectedSize}
              className="h-9 rounded-md px-6 text-xs font-semibold"
            />
          }
        >
          Order Now — {shoe.price} MAD
        </DialogTrigger>
        <DialogContent className="p-8">
          <DialogHeader>
            <DialogTitle>
              {shoe.name} — Size {selectedSize}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="order-name">Name *</Label>
              <Input
                id="order-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="order-phone">Phone</Label>
                <Input
                  id="order-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212..."
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="order-email">Email</Label>
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
              {isPending ? "Placing..." : `Confirm — ${shoe.price} MAD`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </motion.span>
    </div>
  );
}

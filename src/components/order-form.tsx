"use client";

import { useState, useTransition, useEffect } from "react";
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
import { CheckCircle, X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

interface OrderFormProps {
  shoe: ShoeWithSizes;
  mobile?: boolean;
}

const SIZES = [39, 40, 41, 42, 43, 44, 45] as const;

// Validation helpers
const isValidPhone = (phone: string): boolean => {
  // Must start with 05, 06, or 07 and be exactly 10 digits
  const phoneRegex = /^(05|06|07)\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

const isValidEmail = (email: string): boolean => {
  if (!email.trim()) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export function OrderForm({ shoe, mobile }: OrderFormProps) {
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    phone?: string;
    email?: string;
  }>({});
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const sizeStock = (size: number) =>
    shoe.sizes.find((s) => s.size === size)?.stock ?? 0;

  const validateForm = (): boolean => {
    const newErrors: { phone?: string; email?: string } = {};

    if (phone.trim() && !isValidPhone(phone)) {
      newErrors.phone = t("validation.phone");
    }

    if (email.trim() && !isValidEmail(email)) {
      newErrors.email = t("validation.email");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize || !name.trim()) return;

    if (!validateForm()) return;

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

  // Auto-close dialog after 3 seconds on success
  useEffect(() => {
    if (result?.success) {
      const timer = setTimeout(() => {
        setOpen(false);
        // Reset form after closing
        setTimeout(() => {
          setResult(null);
          setName("");
          setPhone("");
          setEmail("");
          setSelectedSize(null);
        }, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [result?.success]);

  return (
    <div className={mobile ? "space-y-4" : "flex items-center gap-4 py-1"}>
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
                  ? `h-10 w-full rounded text-sm font-semibold transition-colors ${selectedSize ? "bg-white text-black hover:bg-white/90" : ""}`
                  : "h-10 rounded-md px-6 text-md font-semibold"
              }
            />
          }
        >
          {t("order.now")} — {shoe.price} MAD
        </DialogTrigger>
        <DialogContent className="p-6 sm:p-8">
          {result?.success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-green-800 sm:text-lg">
                  {t("order.success.title")}
                </h3>
                <p className="mt-2 text-sm text-green-700 sm:text-base">
                  {t("order.success.message")}
                </p>
              </div>
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                className="mt-4 text-sm sm:text-base"
              >
                {t("order.success.close")}
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base">
                  {shoe.name} — {t("order.size")} {selectedSize}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="order-name" className="text-xs sm:text-sm">{t("order.name")}</Label>
                  <Input
                    id="order-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("order.name.placeholder")}
                    required
                    className="mt-1 text-xs sm:text-sm"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <Label htmlFor="order-phone" className="text-xs sm:text-sm">{t("order.phone")}</Label>
                    <Input
                      id="order-phone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="05/06/07..."
                      className={`mt-1 text-xs sm:text-sm ${errors.phone ? "border-red-500" : ""}`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="order-email" className="text-xs sm:text-sm">{t("order.email")}</Label>
                    <Input
                      id="order-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="you@email.com"
                      className={`mt-1 text-xs sm:text-sm ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                {result?.error && (
                  <p className="text-xs text-destructive sm:text-sm">{result.error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isPending || !name.trim()}
                  className="w-full text-xs sm:text-sm"
                >
                  {isPending ? t("order.placing") : `${t("order.confirm")} — ${shoe.price} MAD`}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
      </motion.span>
    </div>
  );
}

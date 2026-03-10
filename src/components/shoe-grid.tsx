"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { assetUrl } from "@/lib/supabase";
import type { ShoeWithSizes, ImageVariant } from "@/lib/types";
import { IMAGE_VARIANTS } from "@/lib/types";
import { OrderForm } from "./order-form";

interface ShoeGridProps {
  shoes: ShoeWithSizes[];
}

const VARIANT_LABELS: Record<ImageVariant, string> = {
  main: "Front",
  standard: "Side",
  worn: "Worn",
  top: "Top",
};

const SPRING = { type: "spring" as const, stiffness: 300, damping: 18 };

export function ShoeGrid({ shoes }: ShoeGridProps) {
  const [focusedShoe, setFocusedShoe] = useState<ShoeWithSizes | null>(null);
  const [heroVariant, setHeroVariant] = useState<ImageVariant>("worn");

  const handleShoeClick = useCallback(
    (shoe: ShoeWithSizes) => {
      if (focusedShoe?.id === shoe.id) return;
      setFocusedShoe(shoe);
      setHeroVariant("worn");
    },
    [focusedShoe],
  );

  const handleClose = useCallback(() => {
    setFocusedShoe(null);
    setHeroVariant("worn");
  }, []);

  useEffect(() => {
    if (!focusedShoe) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const idx = shoes.findIndex((s) => s.id === focusedShoe.id);
      const vIdx = IMAGE_VARIANTS.indexOf(heroVariant);

      switch (e.key) {
        case "ArrowUp": {
          e.preventDefault();
          const prev = shoes[(idx - 1 + shoes.length) % shoes.length];
          setFocusedShoe(prev);
          setHeroVariant("worn");
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const next = shoes[(idx + 1) % shoes.length];
          setFocusedShoe(next);
          setHeroVariant("worn");
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          setHeroVariant(
            IMAGE_VARIANTS[(vIdx - 1 + IMAGE_VARIANTS.length) % IMAGE_VARIANTS.length],
          );
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          setHeroVariant(IMAGE_VARIANTS[(vIdx + 1) % IMAGE_VARIANTS.length]);
          break;
        }
        case "Escape":
          handleClose();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedShoe, heroVariant, shoes, handleClose]);

  return (
    <LayoutGroup>
      {/* Back button — fixed to viewport top-left, outside content padding */}
      <AnimatePresence>
        {focusedShoe && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed left-8 top-[7rem] z-30 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-foreground"
          >
            <FaArrowLeftLong className="h-4 w-6" />
            Back
          </motion.button>
        )}
      </AnimatePresence>

      <div className={`mx-auto flex h-full max-w-7xl flex-col px-4 ${focusedShoe ? "pb-4 my-[-4px]" : "py-4"}`}>

        <motion.div
          layout
          className={focusedShoe ? "flex h-full gap-4" : "h-full"}
          transition={SPRING}
        >
          {/* ─── Detail Panel (fades in when focused) ─── */}
          <AnimatePresence>
            {focusedShoe && (
              <motion.div
                key="detail-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="relative min-w-0 flex-1 overflow-hidden rounded-lg"
              >

                  {/* Hero image */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={heroVariant}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={assetUrl(
                          `item-${focusedShoe.item_number}-${heroVariant}.png`,
                        )}
                        alt={`${focusedShoe.name} - ${VARIANT_LABELS[heroVariant]}`}
                        fill
                        className="object-contain"
                        sizes="80vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom bar — thumbnails (left) + details (right) */}
                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
                    {/* Variant thumbnails */}
                    <div className="flex gap-2">
                      {IMAGE_VARIANTS.map((variant) => (
                        <button
                          key={variant}
                          onClick={() => setHeroVariant(variant)}
                          className={`relative h-12 w-12 overflow-hidden rounded-md border-2 transition-all sm:h-14 sm:w-14 ${
                            heroVariant === variant
                              ? "border-white ring-2 ring-white/30"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={assetUrl(
                              `item-${focusedShoe.item_number}-${variant}.webp`,
                            )}
                            alt={VARIANT_LABELS[variant]}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Name + sizes + order */}
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold leading-tight text-white">
                        {focusedShoe.name}
                      </h2>
                      <OrderForm shoe={focusedShoe} />
                    </div>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Shoe Cards (always mounted, layout animates) ─── */}
          <motion.div
            layout
            className={
              focusedShoe
                ? "flex w-20 shrink-0 flex-col justify-center gap-2 sm:w-24"
                : "grid h-full auto-rows-fr grid-cols-3 gap-4 sm:gap-6"
            }
            transition={SPRING}
          >
            {shoes.map((shoe) => (
              <motion.button
                key={shoe.id}
                layout
                onClick={() => handleShoeClick(shoe)}
                className={`relative overflow-hidden bg-muted ${
                  focusedShoe
                    ? `aspect-square rounded-md ${
                        focusedShoe.id === shoe.id
                          ? "ring-2 ring-foreground"
                          : "opacity-60 hover:opacity-100"
                      }`
                    : "group cursor-pointer rounded-lg"
                }`}
                whileHover={!focusedShoe ? { scale: 1.03 } : undefined}
                whileTap={!focusedShoe ? { scale: 0.98 } : undefined}
                transition={SPRING}
              >
                <Image
                  src={assetUrl(`item-${shoe.item_number}-main.webp`)}
                  alt={shoe.name}
                  fill
                  className={`object-cover ${!focusedShoe ? "transition-transform duration-300 group-hover:scale-105" : ""}`}
                  sizes={focusedShoe ? "96px" : "(max-width: 768px) 33vw, 300px"}
                  priority={shoe.item_number <= 3}
                />

                {/* Name/price overlay — fades out smoothly */}
                <AnimatePresence>
                  {!focusedShoe && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3"
                    >
                      <p className="text-sm font-medium text-white">
                        {shoe.name}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}


          </motion.div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

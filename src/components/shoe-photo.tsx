"use client";

import { useState } from "react";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { assetUrl } from "@/lib/supabase";
import { useLocale } from "@/lib/locale-context";
import type { ShoeWithSizes } from "@/lib/types";

export function ShoePhoto({
  shoe,
  index = 0,
  hero = false,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw",
}: {
  shoe: ShoeWithSizes;
  index?: number;
  hero?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const { t } = useLocale();
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const photo = shoe.images[index];
  const source = photo ? assetUrl(hero ? photo.heroFile : photo.file) : null;
  if (!source || failedSource === source) {
    return (
      <div className="photo-placeholder">
        <Footprints strokeWidth={1} />
        <span>{shoe.name}</span>
      </div>
    );
  }
  return (
    <Image
      src={source}
      alt={`${shoe.name} — ${t("shop.photo")} ${index + 1}`}
      fill
      sizes={sizes}
      preload={priority}
      className="shoe-photo"
      onError={() => setFailedSource(source)}
    />
  );
}

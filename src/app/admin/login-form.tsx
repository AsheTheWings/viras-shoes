"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assetUrl } from "@/lib/supabase";
import { isRtl, t, type Locale } from "@/lib/i18n";
import { loginAdmin } from "./actions";

export function AdminLoginForm({ configured, locale }: { configured: boolean; locale: Locale }) {
  const router = useRouter();
  const dir = isRtl(locale) ? "rtl" : "ltr";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!configured) {
    return (
      <div dir={dir} className="w-full max-w-sm rounded-2xl border border-white/10 bg-black p-8 text-white shadow-2xl">
        <p className="text-sm text-white/70">{t("admin.signin.unconfigured", locale)}</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await loginAdmin(code);
    if (res.ok) {
      setCode("");
      router.refresh();
    } else {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <div
      dir={dir}
      className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black text-white shadow-2xl md:grid-cols-2"
    >
      <div className="relative h-44 md:h-auto md:min-h-[26rem]">
        <Image
          src={assetUrl("item-1-main.webp")}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold tracking-[0.35em]">VIRAS</span>
            <span className="rounded-full border border-[#F5D9C0]/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-[#F5D9C0]">
              {t("admin.signin.badge", locale)}
            </span>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#F5D9C0]/90">
            {t("ticker.text", locale)}
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.signin.title", locale)}</h1>
          <p className="mt-1 text-sm text-white/60">{t("admin.signin.subtitle", locale)}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-code" className="text-white/80">
            {t("admin.signin.code", locale)}
          </Label>
          <div className="relative">
            <LockKeyhole className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="admin-code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={pending}
              className="border-white/15 bg-white/10 ps-9 text-white placeholder:text-white/35"
            />
          </div>
        </div>
        {error ? (
          <p className="text-sm text-red-400">
            {error === "locked"
              ? t("admin.signin.locked", locale)
              : error === "unconfigured"
                ? t("admin.signin.unconfigured", locale)
                : t("admin.signin.wrong", locale)}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={pending || code.length === 0}
          className="w-full bg-[#7B3F1E] text-white hover:bg-[#93522a]"
        >
          {pending ? t("admin.signin.checking", locale) : t("admin.signin.submit", locale)}
        </Button>
      </form>
    </div>
  );
}

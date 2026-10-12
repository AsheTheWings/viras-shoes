"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/i18n";
import { logoutAdmin } from "./actions";

export function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await logoutAdmin();
          router.refresh();
        })
      }
    >
      <LogOut aria-hidden="true" />
      <span className="hidden sm:inline">{t("admin.logout", locale)}</span>
      <span className="sr-only sm:hidden">{t("admin.logout", locale)}</span>
    </Button>
  );
}

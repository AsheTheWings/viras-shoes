"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/i18n";
import { logoutAdmin } from "./actions";

export function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await logoutAdmin();
        router.refresh();
      }}
    >
      {t("admin.logout", locale)}
    </Button>
  );
}

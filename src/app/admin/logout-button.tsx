"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "./actions";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await logoutAdmin();
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}

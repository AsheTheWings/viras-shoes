"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminErrorText, type AdminResult } from "@/lib/admin-errors";
import type { Locale } from "@/lib/i18n";

/**
 * Runs admin server actions with a pending state and an error message in
 * the admin's language. Successful actions refresh the server data.
 */
export function useAdminAction(locale: Locale) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<string[]>([]);

  function run(
    action: () => Promise<AdminResult>,
    onOk?: () => void,
  ): void {
    setError(null);
    setFields([]);
    start(async () => {
      let res: AdminResult;
      try {
        res = await action();
      } catch {
        // Transport failures and oversized requests reject instead of
        // resolving: surface them instead of leaving the button silently dead.
        res = { ok: false, error: "failed" };
      }
      if (res.ok) {
        onOk?.();
        router.refresh();
      } else {
        setError(adminErrorText(res.error, locale));
        setFields(res.fields ?? []);
        if (res.error === "not_signed_in") router.refresh();
      }
    });
  }

  return { pending, error, fields, run, setError };
}

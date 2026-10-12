"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialIcon } from "@/components/social-links";
import { t, type Locale } from "@/lib/i18n";
import {
  SOCIAL_EXAMPLES,
  SOCIAL_NAMES,
  SOCIAL_PLATFORMS,
  normalizeSocialLink,
  type SocialLinks,
  type SocialPlatform,
} from "@/lib/social";
import { saveSocialLinks } from "./actions";
import { useAdminAction } from "./use-admin-action";

type Draft = Record<SocialPlatform, string>;

const toDraft = (links: SocialLinks): Draft =>
  Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p, links[p] ?? ""])) as Draft;

export function SocialSection({
  links,
  locale,
}: {
  links: SocialLinks;
  locale: Locale;
}) {
  const { pending, error, fields, run } = useAdminAction(locale);
  const [draft, setDraft] = useState<Draft>(() => toDraft(links));
  const [saved, setSaved] = useState(false);
  const stored = toDraft(links);
  const dirty = SOCIAL_PLATFORMS.some((p) => draft[p].trim() !== stored[p]);

  return (
    <form
      className="rounded-xl border border-neutral-200 bg-white"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(false);
        run(
          () => saveSocialLinks(draft),
          () => {
            // Show the canonical links the shop now renders.
            setDraft(
              Object.fromEntries(
                SOCIAL_PLATFORMS.map((p) => {
                  const result = normalizeSocialLink(p, draft[p]);
                  return [p, result.ok ? (result.url ?? "") : draft[p]];
                }),
              ) as Draft,
            );
            setSaved(true);
          },
        );
      }}
    >
      <div className="border-b border-neutral-200 p-5">
        <h2 className="font-semibold">{t("admin.social.title", locale)}</h2>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500">{t("admin.social.hint", locale)}</p>
        <p className="mt-1 text-xs text-neutral-400">{t("admin.social.shown", locale)}</p>
      </div>
      <div className="grid gap-x-6 gap-y-5 p-5 md:grid-cols-2">
        {SOCIAL_PLATFORMS.map((platform) => {
          const id = `social-${platform}`;
          const preview = normalizeSocialLink(platform, draft[platform]);
          const invalid = fields.includes(platform) || !preview.ok;
          return (
            <div key={platform} className="space-y-1.5">
              <Label htmlFor={id} className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-neutral-900 text-white">
                  <SocialIcon platform={platform} className="size-3.5" />
                </span>
                {SOCIAL_NAMES[platform]}
              </Label>
              <Input
                id={id}
                dir="ltr"
                value={draft[platform]}
                onChange={(e) => {
                  setSaved(false);
                  setDraft({ ...draft, [platform]: e.target.value });
                }}
                placeholder={SOCIAL_EXAMPLES[platform]}
                disabled={pending}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={invalid || undefined}
                aria-describedby={`${id}-help`}
                className="h-9"
              />
              <p id={`${id}-help`} className="min-h-4 text-xs">
                {invalid ? (
                  <span className="text-red-600">{t("admin.social.invalid", locale)}</span>
                ) : preview.ok && preview.url ? (
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1 text-neutral-500 hover:text-neutral-900"
                  >
                    <span>{t("admin.social.opens", locale)}</span>
                    <span dir="ltr" className="truncate">{preview.url}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                ) : null}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 p-5">
        <Button type="submit" disabled={pending || !dirty}>
          {t("admin.social.save", locale)}
        </Button>
        {saved && !dirty ? (
          <span role="status" className="text-sm text-emerald-700">
            {t("admin.saved", locale)}
          </span>
        ) : null}
        {error ? (
          <span role="alert" className="text-sm text-red-600">
            {error}
          </span>
        ) : null}
      </div>
    </form>
  );
}

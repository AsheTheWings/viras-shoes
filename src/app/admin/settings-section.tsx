"use client";

import { useState } from "react";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialIcon } from "@/components/social-links";
import { t, type Locale } from "@/lib/i18n";
import {
  formatShopPhone,
  normalizeShopEmail,
  normalizeShopPhone,
  type SiteSettings,
} from "@/lib/site-settings";
import {
  SOCIAL_EXAMPLES,
  SOCIAL_NAMES,
  SOCIAL_PLATFORMS,
  normalizeSocialLink,
  type SocialPlatform,
} from "@/lib/social";
import { saveSiteSettings } from "./actions";
import { useAdminAction } from "./use-admin-action";

interface Draft {
  phone: string;
  email: string;
  social: Record<SocialPlatform, string>;
}

function toDraft(settings: SiteSettings): Draft {
  return {
    phone: settings.contact.phone ? formatShopPhone(settings.contact.phone) : "",
    email: settings.contact.email ?? "",
    social: Object.fromEntries(
      SOCIAL_PLATFORMS.map((p) => [p, settings.social[p] ?? ""]),
    ) as Record<SocialPlatform, string>,
  };
}

/** The canonical settings a draft saves as, or null when a field is invalid. */
function canonical(draft: Draft): SiteSettings | null {
  const phone = normalizeShopPhone(draft.phone);
  const email = normalizeShopEmail(draft.email);
  if (!phone.ok || !email.ok) return null;
  const social: SiteSettings["social"] = {};
  for (const p of SOCIAL_PLATFORMS) {
    const result = normalizeSocialLink(p, draft.social[p]);
    if (!result.ok) return null;
    if (result.url) social[p] = result.url;
  }
  return { contact: { phone: phone.phone, email: email.email }, social };
}

function FieldHelp({
  id,
  invalid,
  invalidText,
  children,
}: {
  id: string;
  invalid: boolean;
  invalidText: string;
  children?: React.ReactNode;
}) {
  return (
    <p id={id} className="min-h-4 text-xs">
      {invalid ? <span className="text-red-600">{invalidText}</span> : children}
    </p>
  );
}

export function SettingsSection({
  settings,
  locale,
}: {
  settings: SiteSettings;
  locale: Locale;
}) {
  const { pending, error, fields, run } = useAdminAction(locale);
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings));
  const [saved, setSaved] = useState(false);
  const next = canonical(draft);
  const dirty = JSON.stringify(next) !== JSON.stringify(canonical(toDraft(settings)));
  const edit = (change: Partial<Draft>) => {
    setSaved(false);
    setDraft({ ...draft, ...change });
  };
  const phone = normalizeShopPhone(draft.phone);
  const email = normalizeShopEmail(draft.email);
  const phoneInvalid = fields.includes("phone") || !phone.ok;
  const emailInvalid = fields.includes("email") || !email.ok;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(false);
        run(
          () => saveSiteSettings(draft),
          () => {
            // Show the canonical values the shop now renders.
            if (next) setDraft(toDraft(next));
            setSaved(true);
          },
        );
      }}
    >
      <section className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-5">
          <h2 className="font-semibold">{t("admin.contact.title", locale)}</h2>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">{t("admin.contact.hint", locale)}</p>
        </div>
        <div className="grid gap-x-6 gap-y-5 p-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-phone" className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-neutral-900 text-white">
                <Phone className="size-3.5" aria-hidden="true" />
              </span>
              {t("admin.contact.phone", locale)}
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="off"
              value={draft.phone}
              onChange={(e) => edit({ phone: e.target.value })}
              placeholder="+212 6 12 34 56 78"
              disabled={pending}
              aria-invalid={phoneInvalid || undefined}
              aria-describedby="contact-phone-help"
              className="h-9"
            />
            <FieldHelp
              id="contact-phone-help"
              invalid={phoneInvalid}
              invalidText={t("admin.contact.phoneInvalid", locale)}
            >
              <span className="text-neutral-500">
                {phone.ok && phone.phone ? (
                  <>
                    {t("admin.contact.shownAs", locale)}{" "}
                    <span dir="ltr" className="font-medium text-neutral-700">
                      {formatShopPhone(phone.phone)}
                    </span>
                  </>
                ) : draft.phone.trim() === "" ? (
                  t("admin.contact.hidden", locale)
                ) : null}
                {" · "}
                {t("admin.contact.phoneHint", locale)}
              </span>
            </FieldHelp>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-email" className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-neutral-900 text-white">
                <Mail className="size-3.5" aria-hidden="true" />
              </span>
              {t("admin.contact.email", locale)}
            </Label>
            <Input
              id="contact-email"
              type="email"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              value={draft.email}
              onChange={(e) => edit({ email: e.target.value })}
              placeholder="contact@example.com"
              disabled={pending}
              aria-invalid={emailInvalid || undefined}
              aria-describedby="contact-email-help"
              className="h-9"
            />
            <FieldHelp
              id="contact-email-help"
              invalid={emailInvalid}
              invalidText={t("admin.contact.emailInvalid", locale)}
            >
              {draft.email.trim() === "" ? (
                <span className="text-neutral-500">{t("admin.contact.hidden", locale)}</span>
              ) : null}
            </FieldHelp>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-5">
          <h2 className="font-semibold">{t("admin.social.title", locale)}</h2>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">{t("admin.social.hint", locale)}</p>
          <p className="mt-1 text-xs text-neutral-400">{t("admin.social.shown", locale)}</p>
        </div>
        <div className="grid gap-x-6 gap-y-5 p-5 md:grid-cols-2">
          {SOCIAL_PLATFORMS.map((platform) => {
            const id = `social-${platform}`;
            const preview = normalizeSocialLink(platform, draft.social[platform]);
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
                  value={draft.social[platform]}
                  onChange={(e) =>
                    edit({ social: { ...draft.social, [platform]: e.target.value } })
                  }
                  placeholder={SOCIAL_EXAMPLES[platform]}
                  disabled={pending}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={invalid || undefined}
                  aria-describedby={`${id}-help`}
                  className="h-9"
                />
                <FieldHelp
                  id={`${id}-help`}
                  invalid={invalid}
                  invalidText={t("admin.social.invalid", locale)}
                >
                  {preview.ok && preview.url ? (
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
                </FieldHelp>
              </div>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white/95 p-4 backdrop-blur">
        <Button type="submit" disabled={pending || !dirty || !next}>
          {t("admin.settings.save", locale)}
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

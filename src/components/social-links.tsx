import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaSnapchat,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import {
  SOCIAL_NAMES,
  socialEntries,
  type SocialLinks,
  type SocialPlatform,
} from "@/lib/social";

const ICONS: Record<SocialPlatform, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  youtube: FaYoutube,
  snapchat: FaSnapchat,
  x: FaXTwitter,
};

export function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  const Icon = ICONS[platform];
  return <Icon className={className} aria-hidden="true" focusable="false" />;
}

/** Icon links to the shop's social profiles; renders nothing when none are set. */
export function SocialLinksList({
  links,
  label,
  linkLabel,
  newTab,
  className,
}: {
  links: SocialLinks;
  label: string;
  linkLabel: string;
  newTab: string;
  className?: string;
}) {
  const entries = socialEntries(links);
  if (entries.length === 0) return null;
  return (
    <ul className={className} aria-label={label}>
      {entries.map(({ platform, url }) => (
        <li key={platform}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${linkLabel} ${SOCIAL_NAMES[platform]} ${newTab}`}
            title={SOCIAL_NAMES[platform]}
          >
            <SocialIcon platform={platform} />
          </a>
        </li>
      ))}
    </ul>
  );
}

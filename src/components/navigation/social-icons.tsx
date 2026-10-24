import {
  RiBehanceFill,
  RiBehanceLine,
  RiFacebookFill,
  RiGlobalFill,
  RiGlobalLine,
  RiInstagramFill,
  RiInstagramLine,
  RiLinkedinFill,
  RiPinterestFill,
  RiPinterestLine,
  RiTiktokFill,
  RiTwitterXFill,
  RiTwitterXLine,
  RiVimeoFill,
  RiVimeoLine,
  RiYoutubeFill,
  RiYoutubeLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { SOCIAL_LABELS, type SocialPlatform } from "@/config/site";
import type { SocialLink } from "@/features/settings/schemas";
import { cn } from "@/lib/utils/cn";

const SOCIAL_ICONS: Record<SocialPlatform, RemixiconComponentType> = {
  instagram: RiInstagramLine,
  youtube: RiYoutubeLine,
  vimeo: RiVimeoLine,
  tiktok: RiTiktokFill,
  x: RiTwitterXLine,
  facebook: RiFacebookFill,
  linkedin: RiLinkedinFill,
  behance: RiBehanceLine,
  pinterest: RiPinterestLine,
  website: RiGlobalLine,
};

/** Filled versions, used by the footer and contact page as in the theme. */
const SOCIAL_FILL_ICONS: Record<SocialPlatform, RemixiconComponentType> = {
  instagram: RiInstagramFill,
  youtube: RiYoutubeFill,
  vimeo: RiVimeoFill,
  tiktok: RiTiktokFill,
  x: RiTwitterXFill,
  facebook: RiFacebookFill,
  linkedin: RiLinkedinFill,
  behance: RiBehanceFill,
  pinterest: RiPinterestFill,
  website: RiGlobalFill,
};

export function SocialIcon({ platform, className, fill = true }: { platform: SocialPlatform; className?: string; fill?: boolean }) {
  const Icon = (fill ? SOCIAL_FILL_ICONS : SOCIAL_ICONS)[platform];
  return <Icon className={className} aria-hidden="true" />;
}

type Props = {
  links: SocialLink[];
  className?: string;
};

/** Row of brand icons linking to the site's social profiles; renders nothing when none are set. */
export function SocialIcons({ links, className }: Props) {
  if (links.length === 0) return null;
  return (
    <ul className={cn("flex items-center gap-2.5 leading-none", className)}>
      {links.map((link) => {
        const Icon = SOCIAL_ICONS[link.platform];
        return (
          <li key={`${link.platform}-${link.url}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={SOCIAL_LABELS[link.platform]}
              className="block text-white transition-all duration-300 ease-in-out hover:text-primary"
            >
              <Icon className="size-[1.125rem]" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

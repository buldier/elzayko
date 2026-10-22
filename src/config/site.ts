/**
 * Static fallbacks. Editable values (tagline, hero copy, social links, contact email)
 * live in the SiteSettings table and are managed from /admin/settings.
 */
export const siteConfig = {
  name: "Elzayko",
  defaultDescription:
    "Elzayko — photography, moving image and quiet observations. A personal portfolio and public gallery.",
  locale: "en_GB",
} as const;

export const SOCIAL_PLATFORMS = [
  "instagram",
  "youtube",
  "vimeo",
  "tiktok",
  "x",
  "facebook",
  "linkedin",
  "behance",
  "pinterest",
  "website",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  vimeo: "Vimeo",
  tiktok: "TikTok",
  x: "X",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  behance: "Behance",
  pinterest: "Pinterest",
  website: "Website",
};

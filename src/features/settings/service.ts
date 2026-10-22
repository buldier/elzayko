import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { siteConfig } from "@/config/site";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/db/prisma";
import { validationError } from "@/lib/utils/result";
import { siteSettingsSchema, socialLinkSchema, type SiteSettingsData, type SiteSettingsInput } from "./schemas";

export const DEFAULT_SETTINGS: SiteSettingsData = {
  siteName: siteConfig.name,
  tagline: "Photography & moving image",
  description: siteConfig.defaultDescription,
  heroHeading: "Light, held still.",
  heroIntro:
    "A gallery of photographs and short films — landscapes, rooms and small things noticed slowly.",
  contactEmail: null,
  location: null,
  socialLinks: [],
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.settings);

  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!row) return DEFAULT_SETTINGS;
  const links = socialLinkSchema.array().safeParse(row.socialLinks);
  return {
    siteName: row.siteName,
    tagline: row.tagline,
    description: row.description,
    heroHeading: row.heroHeading,
    heroIntro: row.heroIntro,
    contactEmail: row.contactEmail,
    location: row.location,
    socialLinks: links.success ? links.data : [],
  };
}

export async function saveSiteSettings(raw: SiteSettingsInput) {
  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) throw validationError(parsed.error.issues);
  const data = parsed.data;
  return prisma.siteSettings.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
}

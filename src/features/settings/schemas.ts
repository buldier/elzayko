import { z } from "zod";
import { SOCIAL_PLATFORMS } from "@/config/site";

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: z
    .url({ protocol: /^https$/, message: "Use a full https:// URL" })
    .max(300),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160),
  description: z.string().trim().max(300),
  heroHeading: z.string().trim().min(1, "Hero heading is required").max(160),
  heroIntro: z.string().trim().max(600),
  heroMediaId: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || null)
    .nullable()
    .default(null),
  contactEmail: z
    .union([z.email("Enter a valid email"), z.literal("")])
    .transform((value) => value || null)
    .nullable(),
  location: z
    .string()
    .trim()
    .max(120)
    .transform((value) => value || null)
    .nullable(),
  socialLinks: z.array(socialLinkSchema).max(12).default([]),
});

export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
export type SiteSettingsData = z.infer<typeof siteSettingsSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;

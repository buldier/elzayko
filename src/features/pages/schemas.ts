import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

export const aboutContentSchema = z.object({
  heading: text(160).min(1, "Heading is required"),
  intro: text(600),
  portraitMediaId: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || null)
    .nullable()
    .default(null),
  biography: text(6000),
  philosophy: text(3000),
  interests: z.array(text(60).min(1)).max(16).default([]),
  highlights: z
    .array(z.object({ year: text(12), title: text(120).min(1), detail: text(300) }))
    .max(20)
    .default([]),
  ctaHeading: text(120),
  ctaText: text(300),
});

export const contactContentSchema = z.object({
  heading: text(160).min(1, "Heading is required"),
  intro: text(800),
  responseTime: text(160),
  privacyNote: text(600),
});

export const legalContentSchema = z.object({
  lastUpdated: text(40),
  /** Light markup: blank-line paragraphs, `## ` headings, `- ` bullet lists. */
  body: text(30000).min(1, "Body is required"),
});

export const PAGE_SCHEMAS = {
  about: aboutContentSchema,
  contact: contactContentSchema,
  privacy: legalContentSchema,
  terms: legalContentSchema,
} as const;

export type PageSlug = keyof typeof PAGE_SCHEMAS;
export const PAGE_SLUGS = Object.keys(PAGE_SCHEMAS) as PageSlug[];

export type AboutContent = z.infer<typeof aboutContentSchema>;
export type ContactContent = z.infer<typeof contactContentSchema>;
export type LegalContent = z.infer<typeof legalContentSchema>;
export type PageContent<S extends PageSlug> = z.infer<(typeof PAGE_SCHEMAS)[S]>;

export function isPageSlug(value: string): value is PageSlug {
  return value in PAGE_SCHEMAS;
}

import { z } from "zod";
import { MEDIA_LIMITS } from "@/config/media";
import { UPLOAD_KEY_PATTERN } from "@/lib/storage/keys";
import { isValidSlug } from "@/lib/utils/slug";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

const idSchema = z.string().trim().min(1).max(40).regex(/^[a-z0-9]+$/i, "Invalid id");

export const mediaStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const tagListSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(20, "Use at most 20 tags")
  .default([]);

const metadataShape = {
  title: z.string().trim().min(1, "Title is required").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(180)
    .refine((value) => value === "" || isValidSlug(value), "Use lowercase letters, numbers and single hyphens")
    .optional(),
  description: optionalText(5000),
  caption: optionalText(300),
  altText: optionalText(300),
  categoryId: idSchema.nullable().optional(),
  collectionIds: z.array(idSchema).max(30).default([]),
  tags: tagListSchema,
  status: mediaStatusSchema.default("DRAFT"),
  featured: z.boolean().default(false),
  allowDownload: z.boolean().default(false),
};

export const uploadKeySchema = z.string().regex(UPLOAD_KEY_PATTERN, "Invalid upload reference");

export const createUploadedMediaSchema = z
  .object({
    ...metadataShape,
    source: z.literal("upload"),
    storageKey: uploadKeySchema,
    posterKey: uploadKeySchema.nullable().optional(),
    /** Client-measured video metadata; only used as display hints. */
    videoMeta: z
      .object({
        width: z.number().int().positive().max(16384).optional(),
        height: z.number().int().positive().max(16384).optional(),
        duration: z.number().nonnegative().max(60 * 60 * 12).optional(),
      })
      .optional(),
  });

export const createExternalMediaSchema = z.object({
  ...metadataShape,
  source: z.literal("external"),
  url: z.string().trim().min(1, "URL is required").max(2048),
  allowDownload: z.literal(false).default(false),
});

export const createMediaSchema = z.union([createUploadedMediaSchema, createExternalMediaSchema]);

export const updateMediaSchema = z.object({
  ...metadataShape,
  id: idSchema,
  /** Only applied to external media. */
  url: z.string().trim().max(2048).optional(),
  /** Replace or remove the poster of an uploaded video. */
  posterKey: uploadKeySchema.nullable().optional(),
});

export type CreateUploadedMediaInput = z.input<typeof createUploadedMediaSchema>;
export type CreateExternalMediaInput = z.input<typeof createExternalMediaSchema>;
export type CreateMediaInput = z.input<typeof createMediaSchema>;
export type UpdateMediaInput = z.input<typeof updateMediaSchema>;

export const uploadRequestSchema = z
  .object({
    kind: z.enum(["image", "video"]),
    filename: z.string().trim().min(1).max(255),
    contentType: z.string().trim().max(100),
    size: z.number().int().positive(),
  })
  .superRefine((value, ctx) => {
    const policy = MEDIA_LIMITS[value.kind];
    if (!(policy.mimeTypes as readonly string[]).includes(value.contentType)) {
      ctx.addIssue({ code: "custom", path: ["contentType"], message: `Unsupported ${value.kind} format` });
    }
    if (value.size > policy.maxBytes) {
      ctx.addIssue({
        code: "custom",
        path: ["size"],
        message: `File is larger than ${Math.round(policy.maxBytes / 1024 / 1024)} MB`,
      });
    }
  });

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

export const galleryTypeSchema = z.enum(["all", "image", "video", "link"]);

/** Public gallery filters parsed from search params. Invalid values fall back to defaults. */
export const galleryFiltersSchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  type: galleryTypeSchema.catch("all").default("all"),
  category: z.string().trim().max(100).catch("").default(""),
  collection: z.string().trim().max(140).catch("").default(""),
  tag: z.string().trim().max(80).catch("").default(""),
  page: z.coerce.number().int().min(1).max(500).catch(1).default(1),
});

export type GalleryFilters = z.infer<typeof galleryFiltersSchema>;

export function parseGalleryFilters(params: Record<string, string | string[] | undefined>): GalleryFilters {
  const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return galleryFiltersSchema.parse({
    q: single(params.q),
    type: single(params.type),
    category: single(params.category),
    collection: single(params.collection),
    tag: single(params.tag),
    page: single(params.page),
  });
}

export const adminMediaFiltersSchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  status: z.enum(["all", "DRAFT", "PUBLISHED", "ARCHIVED"]).catch("all").default("all"),
  type: galleryTypeSchema.catch("all").default("all"),
  sort: z.enum(["newest", "oldest", "title", "updated"]).catch("newest").default("newest"),
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});

export type AdminMediaFilters = z.infer<typeof adminMediaFiltersSchema>;

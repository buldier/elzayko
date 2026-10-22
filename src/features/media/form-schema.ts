import { z } from "zod";

/**
 * Client-side form shape for the metadata editor. The server re-validates with
 * `createMediaSchema` / `updateMediaSchema`; this only drives inline field errors.
 */
export const mediaFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(160),
    slug: z
      .string()
      .trim()
      .max(180)
      .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only"),
    caption: z.string().max(300),
    altText: z.string().max(300),
    description: z.string().max(5000),
    categoryId: z.string(),
    collectionIds: z.array(z.string()),
    tags: z.string().max(900),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    featured: z.boolean(),
    allowDownload: z.boolean(),
    url: z.string().max(2048),
    mediaType: z.enum(["IMAGE", "VIDEO", "LINK"]),
  })
  .superRefine((value, ctx) => {
    if (value.status === "PUBLISHED" && value.mediaType === "IMAGE" && !value.altText.trim()) {
      ctx.addIssue({ code: "custom", path: ["altText"], message: "Alt text is required before publishing an image" });
    }
  });

export type MediaFormValues = z.infer<typeof mediaFormSchema>;

export function parseTags(value: string): string[] {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 20);
}

/** Maps form values to the shared metadata part of the action payload. */
export function toMetadataPayload(values: MediaFormValues) {
  return {
    title: values.title,
    slug: values.slug || undefined,
    caption: values.caption,
    altText: values.altText,
    description: values.description,
    categoryId: values.categoryId || null,
    collectionIds: values.collectionIds,
    tags: parseTags(values.tags),
    status: values.status,
    featured: values.featured,
    allowDownload: values.allowDownload,
  };
}

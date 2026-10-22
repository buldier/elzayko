import { z } from "zod";
import { isValidSlug } from "@/lib/utils/slug";

export const collectionInputSchema = z.object({
  id: z.string().trim().max(40).optional(),
  title: z.string().trim().min(1, "Title is required").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(140)
    .refine((value) => value === "" || isValidSlug(value), "Use lowercase letters, numbers and hyphens")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000)
    .transform((value) => value || null)
    .nullable()
    .optional(),
  featured: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(-1000).max(1000).default(0),
  coverId: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || null)
    .nullable()
    .optional(),
});

export type CollectionInput = z.input<typeof collectionInputSchema>;

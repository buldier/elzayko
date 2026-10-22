import { z } from "zod";
import { isValidSlug } from "@/lib/utils/slug";

export const categoryInputSchema = z.object({
  id: z.string().trim().max(40).optional(),
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(100)
    .refine((value) => value === "" || isValidSlug(value), "Use lowercase letters, numbers and hyphens")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500)
    .transform((value) => value || null)
    .nullable()
    .optional(),
  sortOrder: z.coerce.number().int().min(-1000).max(1000).default(0),
});

export type CategoryInput = z.input<typeof categoryInputSchema>;

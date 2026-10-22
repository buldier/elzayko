import { z } from "zod";

/** Minimum time (ms) a human plausibly needs to fill in the form. */
export const MIN_FILL_TIME_MS = 3000;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120, "Name is too long"),
  email: z.email("Please enter a valid email address").max(254),
  subject: z.string().trim().min(2, "Please add a subject").max(160, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Your message should be at least 10 characters")
    .max(5000, "Please keep your message under 5000 characters"),
  /** Honeypot: hidden from people, often filled by bots. Must be empty. */
  website: z.string().max(0).optional().default(""),
  /** Client timestamp (ms) when the form was first rendered; used as a weak bot signal. */
  startedAt: z.coerce.number().int().nonnegative().optional(),
});

export type ContactInput = z.input<typeof contactSchema>;

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string[]>>;
  values?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
};

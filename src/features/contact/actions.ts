"use server";

import { headers } from "next/headers";
import { getClientIp } from "@/lib/utils/request";
import { AppError } from "@/lib/utils/result";
import type { ContactFormState } from "./schemas";
import { submitContact } from "./service";

const FIELDS = ["name", "email", "subject", "message"] as const;

export async function sendContactMessage(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? "")])) as Record<
    (typeof FIELDS)[number],
    string
  >;
  const requestHeaders = await headers();
  try {
    await submitContact(
      { ...values, website: String(formData.get("website") ?? ""), startedAt: formData.get("startedAt") ?? undefined },
      { ip: getClientIp(requestHeaders), userAgent: requestHeaders.get("user-agent") },
    );
    return { status: "success", message: "Thank you — your message has been sent." };
  } catch (error) {
    if (error instanceof AppError) {
      return { status: "error", message: error.message, fieldErrors: error.fieldErrors, values };
    }
    console.error("[contact] unexpected error", error);
    return { status: "error", message: "Your message could not be sent. Please try again shortly.", values };
  }
}

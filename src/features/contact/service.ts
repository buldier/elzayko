import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getEmailProvider } from "@/lib/email";
import { env } from "@/lib/env";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { hashIp } from "@/lib/utils/request";
import { AppError, validationError } from "@/lib/utils/result";
import { getSiteSettings } from "@/features/settings/service";
import { contactSchema, MIN_FILL_TIME_MS } from "./schemas";

export type ContactContext = { ip: string; userAgent: string | null; now?: number };

/**
 * Validates, rate-limits and stores a contact submission, then notifies the author.
 * Spam signals (honeypot, too-fast submission) are accepted silently but not stored or emailed,
 * so bots get no feedback to adapt to.
 */
export async function submitContact(raw: unknown, context: ContactContext): Promise<{ stored: boolean }> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const honeypotOnly = parsed.error.issues.every((issue) => issue.path[0] === "website");
    if (honeypotOnly) return { stored: false };
    throw validationError(parsed.error.issues);
  }
  const input = parsed.data;
  const now = context.now ?? Date.now();
  if (input.startedAt && now - input.startedAt < MIN_FILL_TIME_MS) return { stored: false };

  const limit = await rateLimit(`contact:${hashIp(context.ip)}`, RATE_LIMITS.contact);
  if (!limit.allowed) {
    throw new AppError("You have sent several messages recently. Please try again later.", "RATE_LIMITED");
  }

  const submission = await prisma.contactSubmission.create({
    data: {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      ipHash: context.ip === "unknown" ? null : hashIp(context.ip),
      userAgent: context.userAgent?.slice(0, 300) ?? null,
    },
    select: { id: true },
  });

  const recipient = env().CONTACT_RECIPIENT ?? (await getSiteSettings()).contactEmail;
  if (recipient) {
    const result = await getEmailProvider().send({
      to: recipient,
      replyTo: input.email,
      subject: `[Elzayko] ${input.subject}`,
      text: `New message from ${input.name} <${input.email}>\n\n${input.message}\n\n— Sent via the Elzayko contact form (ref ${submission.id})`,
    });
    if (result.delivered) {
      await prisma.contactSubmission.update({ where: { id: submission.id }, data: { emailDelivered: true } });
    } else if (result.error) {
      console.error(`[contact] email delivery failed via ${result.provider}: ${result.error}`);
    }
  } else {
    console.warn("[contact] No CONTACT_RECIPIENT or settings contact email configured; message stored only.");
  }

  return { stored: true };
}

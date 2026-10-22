import "server-only";
import { env } from "@/lib/env";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type EmailResult = { delivered: boolean; provider: string; error?: string };

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailResult>;
}

/** Development fallback: logs the message instead of sending it. Never reports delivery. */
class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";
  async send(message: EmailMessage): Promise<EmailResult> {
    console.info(
      `[email:console] To: ${message.to}\nSubject: ${message.subject}\nReply-To: ${message.replyTo ?? "-"}\n\n${message.text}`,
    );
    return { delivered: false, provider: this.name };
  }
}

/** Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email). */
class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          reply_to: message.replyTo,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        return { delivered: false, provider: this.name, error: `Resend responded ${response.status}` };
      }
      return { delivered: true, provider: this.name };
    } catch (error) {
      return { delivered: false, provider: this.name, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
}

let instance: EmailProvider | undefined;

export function getEmailProvider(): EmailProvider {
  if (instance) return instance;
  const config = env();
  instance =
    config.EMAIL_DRIVER === "resend"
      ? new ResendEmailProvider(config.RESEND_API_KEY!, config.EMAIL_FROM!)
      : new ConsoleEmailProvider();
  return instance;
}

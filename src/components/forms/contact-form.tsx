"use client";

import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { InlineAlert } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input, Textarea } from "@/components/ui/form-controls";
import { sendContactMessage } from "@/features/contact/actions";
import type { ContactFormState } from "@/features/contact/schemas";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);
  const startedAtRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Minimum-fill-time spam check: stamp the moment the visitor first interacts with the form.
  function markStarted() {
    if (startedAtRef.current && !startedAtRef.current.value) startedAtRef.current.value = String(Date.now());
  }

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const errors = state.fieldErrors ?? {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <form ref={formRef} action={formAction} onFocusCapture={markStarted} noValidate className="space-y-6" aria-describedby="contact-privacy">
      <div ref={statusRef} tabIndex={-1} className="outline-none">
        {state.status === "success" && <InlineAlert tone="success">{state.message}</InlineAlert>}
        {state.status === "error" && <InlineAlert tone="error">{state.message}</InlineAlert>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-name" label="Name" required error={errors.name}>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            defaultValue={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("contact-name", errors.name)}
          />
        </Field>
        <Field id="contact-email" label="Email" required error={errors.email}>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            defaultValue={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("contact-email", errors.email)}
          />
        </Field>
      </div>

      <Field id="contact-subject" label="Subject" required error={errors.subject}>
        <Input
          id="contact-subject"
          name="subject"
          required
          maxLength={160}
          defaultValue={values.subject}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={describedBy("contact-subject", errors.subject)}
        />
      </Field>

      <Field id="contact-message" label="Message" required error={errors.message} hint="10–5000 characters">
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={7}
          maxLength={5000}
          defaultValue={values.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("contact-message", errors.message, true)}
        />
      </Field>

      {/* Honeypot: visually hidden and skipped by assistive tech; real visitors leave it empty. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p id="contact-privacy" className="max-w-sm text-xs leading-relaxed text-muted">
          Your details are used only to reply to you. See the{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
            privacy policy
          </Link>
          .
        </p>
        <Button type="submit" size="lg" disabled={pending} aria-disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}

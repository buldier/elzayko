"use client";

import { RiCheckboxCircleLine, RiErrorWarningLine, RiLoader4Line } from "@remixicon/react";
import Link from "next/link";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { describedBy } from "@/components/ui/form-controls";
import { sendContactMessage } from "@/features/contact/actions";
import type { ContactFormState } from "@/features/contact/schemas";

const initialState: ContactFormState = { status: "idle" };
const inputClass = "form-input !bg-black";

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
    <form ref={formRef} action={formAction} onFocusCapture={markStarted} noValidate aria-describedby="contact-privacy">
      <div ref={statusRef} tabIndex={-1} className="outline-none">
        {state.status === "success" && (
          <FormAlert tone="success" icon={<RiCheckboxCircleLine className="size-5" />}>
            {state.message}
          </FormAlert>
        )}
        {state.status === "error" && (
          <FormAlert tone="error" icon={<RiErrorWarningLine className="size-5" />}>
            {state.message}
          </FormAlert>
        )}
      </div>

      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px]">
        <FormField id="contact-name" label="Name" required error={errors.name}>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            placeholder="Your name"
            defaultValue={values.name}
            className={inputClass}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("contact-name", errors.name)}
          />
        </FormField>
        <FormField id="contact-email" label="Email" required error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="your.email@example.com"
            defaultValue={values.email}
            className={inputClass}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("contact-email", errors.email)}
          />
        </FormField>
        <FormField id="contact-subject" label="Subject" required error={errors.subject} className="md:col-span-2">
          <input
            id="contact-subject"
            name="subject"
            required
            maxLength={160}
            placeholder="Your subject"
            defaultValue={values.subject}
            className={inputClass}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={describedBy("contact-subject", errors.subject)}
          />
        </FormField>
        <FormField id="contact-message" label="Message" required error={errors.message} hint="10–5000 characters" className="md:col-span-2">
          <textarea
            id="contact-message"
            name="message"
            required
            maxLength={5000}
            placeholder="Tell me how I can help…"
            defaultValue={values.message}
            className={inputClass}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy("contact-message", errors.message, true)}
          />
        </FormField>
      </div>

      {/* Honeypot: visually hidden and skipped by assistive tech; real visitors leave it empty. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <div className="mt-[20px] flex flex-col gap-[15px] sm:flex-row sm:items-center sm:justify-between md:mt-[25px]">
        <button type="submit" className="primary-btn" disabled={pending} aria-disabled={pending}>
          {pending && <RiLoader4Line className="size-4 animate-spin" aria-hidden="true" />}
          {pending ? "Sending…" : "Send message"}
        </button>
        <p id="contact-privacy" className="max-w-sm text-sm text-[#a0a0a0]">
          Your details are used only to reply to you. See the{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string | string[];
  required?: boolean;
  className?: string;
  children: ReactNode;
};

function FormField({ id, label, hint, error, required, className, children }: FormFieldProps) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-[8px] block text-[#a0a0a0]">
        {label} {required && <span className="text-[#FF0004]" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !message && (
        <p id={`${id}-hint`} className="mt-[6px] text-sm text-[#a0a0a0]/70">
          {hint}
        </p>
      )}
      {message && (
        <p id={`${id}-error`} role="alert" className="mt-[6px] text-sm font-medium text-primary">
          {message}
        </p>
      )}
    </div>
  );
}

function FormAlert({ tone, icon, children }: { tone: "success" | "error"; icon: ReactNode; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`mb-[20px] flex items-start gap-[10px] border px-[15px] py-[12px] md:mb-[25px] ${tone === "error" ? "border-primary/60 bg-primary/10 text-white" : "border-emerald-500/50 bg-emerald-500/10 text-white"}`}
    >
      <span className={tone === "error" ? "text-primary" : "text-emerald-400"} aria-hidden="true">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}

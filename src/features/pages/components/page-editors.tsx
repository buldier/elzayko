"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useToast } from "@/components/admin/toaster";
import { InlineAlert } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { savePageAction } from "../actions";
import type { AboutContent, ContactContent, LegalContent, PageSlug } from "../schemas";

function useSavePage(slug: PageSlug) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function save(title: string, content: unknown) {
    setError(null);
    startTransition(async () => {
      const result = await savePageAction(slug, title, content);
      if (result.ok) {
        toast(result.message ?? "Saved");
        router.refresh();
      } else {
        setError(result.error);
        toast(result.error, "error");
      }
    });
  }
  return { save, error, pending };
}

function SaveBar({ pending, error }: { pending: boolean; error: string | null }) {
  return (
    <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center gap-4 rounded-b-md border-t border-line bg-surface/95 px-6 py-4 backdrop-blur-sm sm:-mx-8 sm:-mb-8 sm:px-8">
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Save page
      </Button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5 border-t border-line pt-6">
      <legend className="eyebrow pr-3">{title}</legend>
      {children}
    </fieldset>
  );
}

type AboutForm = Omit<AboutContent, "interests" | "portraitMediaId"> & { title: string; interests: string; portraitMediaId: string };

export function AboutEditor({ title, content, imageOptions }: { title: string; content: AboutContent; imageOptions: { id: string; label: string }[] }) {
  const { save, error, pending } = useSavePage("about");
  const { register, control, handleSubmit } = useForm<AboutForm>({
    defaultValues: { ...content, title, interests: content.interests.join(", "), portraitMediaId: content.portraitMediaId ?? "" },
  });
  const highlights = useFieldArray({ control, name: "highlights" });

  return (
    <form
      className="space-y-8 rounded-md border border-line bg-surface shadow-card p-6 sm:p-8"
      onSubmit={handleSubmit(({ title: pageTitle, interests, ...rest }) =>
        save(pageTitle, { ...rest, interests: interests.split(",").map((value) => value.trim()).filter(Boolean) }),
      )}
    >
      <Section title="Introduction">
        <Field id="about-title" label="Page title (browser tab & SEO)">
          <Input id="about-title" {...register("title")} />
        </Field>
        <Field id="about-heading" label="Heading">
          <Input id="about-heading" {...register("heading")} />
        </Field>
        <Field id="about-intro" label="Introduction">
          <Textarea id="about-intro" rows={3} {...register("intro")} />
        </Field>
        <Field id="about-portrait" label="Portrait" hint="Choose one of your uploaded images">
          <Select id="about-portrait" {...register("portraitMediaId")}>
            <option value="">No portrait</option>
            {imageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </Section>
      <Section title="Story">
        <Field id="about-bio" label="Biography" hint="Separate paragraphs with a blank line">
          <Textarea id="about-bio" rows={8} {...register("biography")} />
        </Field>
        <Field id="about-philosophy" label="Creative philosophy">
          <Textarea id="about-philosophy" rows={4} {...register("philosophy")} />
        </Field>
        <Field id="about-interests" label="Areas of interest" hint="Comma separated">
          <Input id="about-interests" {...register("interests")} />
        </Field>
      </Section>
      <Section title="Selected highlights">
        <ul className="space-y-4">
          {highlights.fields.map((field, index) => (
            <li key={field.id} className="grid gap-3 rounded-sm border border-line bg-paper-raised p-4 sm:grid-cols-[6rem_1fr_auto]">
              <Field id={`hl-year-${index}`} label="Year">
                <Input id={`hl-year-${index}`} {...register(`highlights.${index}.year`)} />
              </Field>
              <div className="space-y-3">
                <Field id={`hl-title-${index}`} label="Title">
                  <Input id={`hl-title-${index}`} {...register(`highlights.${index}.title`)} />
                </Field>
                <Field id={`hl-detail-${index}`} label="Detail">
                  <Input id={`hl-detail-${index}`} {...register(`highlights.${index}.detail`)} />
                </Field>
              </div>
              <Button variant="ghost" size="icon-sm" className="self-start" onClick={() => highlights.remove(index)} aria-label={`Remove highlight ${index + 1}`}>
                <Trash2 className="text-danger" />
              </Button>
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="sm" onClick={() => highlights.append({ year: "", title: "", detail: "" })}>
          <Plus /> Add highlight
        </Button>
      </Section>
      <Section title="Call to action">
        <Field id="about-cta-heading" label="Heading">
          <Input id="about-cta-heading" {...register("ctaHeading")} />
        </Field>
        <Field id="about-cta-text" label="Text">
          <Textarea id="about-cta-text" rows={2} className="min-h-0" {...register("ctaText")} />
        </Field>
      </Section>
      <SaveBar pending={pending} error={error} />
    </form>
  );
}

export function ContactEditor({ title, content }: { title: string; content: ContactContent }) {
  const { save, error, pending } = useSavePage("contact");
  const { register, handleSubmit } = useForm<ContactContent & { title: string }>({ defaultValues: { ...content, title } });
  return (
    <form className="space-y-6 rounded-md border border-line bg-surface shadow-card p-6 sm:p-8" onSubmit={handleSubmit(({ title: pageTitle, ...rest }) => save(pageTitle, rest))}>
      <Field id="contact-title" label="Page title">
        <Input id="contact-title" {...register("title")} />
      </Field>
      <Field id="contact-heading" label="Heading">
        <Input id="contact-heading" {...register("heading")} />
      </Field>
      <Field id="contact-intro" label="Introduction">
        <Textarea id="contact-intro" rows={4} {...register("intro")} />
      </Field>
      <Field id="contact-response" label="Response time note">
        <Input id="contact-response" {...register("responseTime")} />
      </Field>
      <Field id="contact-privacy" label="Privacy notice" hint="Shown under the contact form">
        <Textarea id="contact-privacy" rows={3} {...register("privacyNote")} />
      </Field>
      <InlineAlert>The contact email, location and social links are edited in Settings.</InlineAlert>
      <SaveBar pending={pending} error={error} />
    </form>
  );
}

export function LegalEditor({ slug, title, content }: { slug: "privacy" | "terms"; title: string; content: LegalContent }) {
  const { save, error, pending } = useSavePage(slug);
  const { register, handleSubmit } = useForm<LegalContent & { title: string }>({ defaultValues: { ...content, title } });
  return (
    <form className="space-y-6 rounded-md border border-line bg-surface shadow-card p-6 sm:p-8" onSubmit={handleSubmit(({ title: pageTitle, ...rest }) => save(pageTitle, rest))}>
      <InlineAlert>Placeholder legal text must be reviewed before the site is used in production.</InlineAlert>
      <Field id={`${slug}-title`} label="Page title">
        <Input id={`${slug}-title`} {...register("title")} />
      </Field>
      <Field id={`${slug}-updated`} label="Last updated (shown on the page)">
        <Input id={`${slug}-updated`} {...register("lastUpdated")} />
      </Field>
      <Field id={`${slug}-body`} label="Body" hint="Blank line between paragraphs · start a line with “## ” for a heading · “- ” for list items">
        <Textarea id={`${slug}-body`} rows={22} className="font-mono text-sm" {...register("body")} />
      </Field>
      <SaveBar pending={pending} error={error} />
    </form>
  );
}

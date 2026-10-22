"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { InlineAlert } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input, Select, Textarea, Toggle } from "@/components/ui/form-controls";
import { slugify } from "@/lib/utils/slug";
import { mediaFormSchema, type MediaFormValues } from "../form-schema";

export type TaxonomyOption = { id: string; label: string };

type Props = {
  defaultValues: MediaFormValues;
  categories: TaxonomyOption[];
  collections: TaxonomyOption[];
  /** Whether "allow download" applies (uploaded images only). */
  canDownload: boolean;
  showUrl: boolean;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: MediaFormValues) => Promise<Record<string, string[] | undefined> | void>;
  /** Rendered next to the form; receives the live form for previews. */
  aside?: (form: UseFormReturn<MediaFormValues>) => ReactNode;
  disabled?: boolean;
};

export function MediaMetadataForm({
  defaultValues,
  categories,
  collections,
  canDownload,
  showUrl,
  submitLabel,
  serverError,
  onSubmit,
  aside,
  disabled,
}: Props) {
  const form = useForm<MediaFormValues>({ resolver: zodResolver(mediaFormSchema), defaultValues, mode: "onBlur" });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSubmit(values);
    if (fieldErrors) {
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages?.[0] && field in defaultValues) setError(field as keyof MediaFormValues, { message: messages[0] });
      }
    }
  });

  const err = (name: keyof MediaFormValues) => errors[name]?.message;

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-6 rounded-md border border-line bg-surface shadow-card p-5 sm:p-7">
        {serverError && <InlineAlert tone="error">{serverError}</InlineAlert>}

        {showUrl && (
          <Field id="media-url" label="URL" required error={err("url")} hint="YouTube video URL, or any public post / page link">
            <Input id="media-url" type="url" inputMode="url" {...register("url")} aria-invalid={Boolean(errors.url)} aria-describedby={describedBy("media-url", errors.url, true)} />
          </Field>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Field id="media-title" label="Title" required error={err("title")}>
            <Input
              id="media-title"
              {...register("title", {
                onBlur: (event) => {
                  if (!form.getValues("slug")) form.setValue("slug", slugify(event.target.value, 120));
                },
              })}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy("media-title", errors.title)}
            />
          </Field>
          <Field id="media-slug" label="URL slug" error={err("slug")} hint="Leave blank to generate from the title">
            <Input id="media-slug" {...register("slug")} aria-invalid={Boolean(errors.slug)} aria-describedby={describedBy("media-slug", errors.slug, true)} />
          </Field>
        </div>

        <Field id="media-caption" label="Caption" error={err("caption")} hint="One line shown under the title">
          <Input id="media-caption" {...register("caption")} aria-describedby={describedBy("media-caption", errors.caption, true)} />
        </Field>

        <Field
          id="media-alt"
          label="Alternative text"
          error={err("altText")}
          hint="Describe what the image shows for people using screen readers. Required to publish images."
        >
          <Textarea id="media-alt" rows={2} className="min-h-0" {...register("altText")} aria-invalid={Boolean(errors.altText)} aria-describedby={describedBy("media-alt", errors.altText, true)} />
        </Field>

        <Field id="media-description" label="Description" error={err("description")}>
          <Textarea id="media-description" rows={6} {...register("description")} />
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field id="media-category" label="Category">
            <Select id="media-category" {...register("categoryId")}>
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="media-tags" label="Tags" error={err("tags")} hint="Comma separated, e.g. sea, winter, light">
            <Input id="media-tags" {...register("tags")} aria-describedby={describedBy("media-tags", errors.tags, true)} />
          </Field>
        </div>

        {collections.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Collections</legend>
            <div className="flex flex-wrap gap-2">
              {collections.map((collection) => (
                <label key={collection.id} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-sm has-checked:border-ink has-checked:bg-ink has-checked:text-paper">
                  <input type="checkbox" value={collection.id} className="sr-only" {...register("collectionIds")} />
                  {collection.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        {aside?.(form)}
        <div className="space-y-5 rounded-md border border-line bg-surface shadow-card p-5">
          <Field id="media-status" label="Status">
            <Select id="media-status" {...register("status")}>
              <option value="DRAFT">Draft — only visible here</option>
              <option value="PUBLISHED">Published — visible to everyone</option>
              <option value="ARCHIVED">Archived — hidden</option>
            </Select>
          </Field>
          <Toggle id="media-featured" label="Featured" description="Show on the homepage" {...register("featured")} />
          {canDownload && (
            <Toggle id="media-download" label="Allow download" description="Visitors can download the original file" {...register("allowDownload")} />
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || disabled}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

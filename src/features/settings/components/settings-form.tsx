"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useToast } from "@/components/admin/toaster";
import { InlineAlert } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { SOCIAL_LABELS, SOCIAL_PLATFORMS } from "@/config/site";
import { saveSettingsAction } from "../actions";
import { siteSettingsSchema, type SiteSettingsData, type SiteSettingsInput } from "../schemas";

type FormValues = SiteSettingsInput;

export function SettingsForm({ settings }: { settings: SiteSettingsData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, SiteSettingsData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: { ...settings, contactEmail: settings.contactEmail ?? "", location: settings.location ?? "" },
  });
  const links = useFieldArray({ control, name: "socialLinks" });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await saveSettingsAction(values);
    if (result.ok) {
      toast(result.message ?? "Saved");
      router.refresh();
    } else {
      setServerError(result.error);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8 rounded-md border border-line bg-surface shadow-card p-6 sm:p-8">
      {serverError && <InlineAlert tone="error">{serverError}</InlineAlert>}
      <fieldset className="space-y-5">
        <legend className="eyebrow mb-2">Identity</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="settings-name" label="Site name" error={errors.siteName?.message}>
            <Input id="settings-name" {...register("siteName")} aria-invalid={Boolean(errors.siteName)} />
          </Field>
          <Field id="settings-tagline" label="Tagline" error={errors.tagline?.message}>
            <Input id="settings-tagline" {...register("tagline")} />
          </Field>
        </div>
        <Field id="settings-description" label="SEO description" error={errors.description?.message} hint="Used in search results and link previews">
          <Textarea id="settings-description" rows={2} className="min-h-0" {...register("description")} aria-describedby={describedBy("settings-description", errors.description, true)} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-6">
        <legend className="eyebrow pr-3">Homepage hero</legend>
        <Field id="settings-hero" label="Heading" error={errors.heroHeading?.message}>
          <Input id="settings-hero" {...register("heroHeading")} aria-invalid={Boolean(errors.heroHeading)} />
        </Field>
        <Field id="settings-hero-intro" label="Introduction" error={errors.heroIntro?.message}>
          <Textarea id="settings-hero-intro" rows={3} {...register("heroIntro")} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-6">
        <legend className="eyebrow pr-3">Contact</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="settings-email" label="Public contact email" error={errors.contactEmail?.message} hint="Also receives contact form messages unless CONTACT_RECIPIENT is set">
            <Input id="settings-email" type="email" {...register("contactEmail")} aria-invalid={Boolean(errors.contactEmail)} aria-describedby={describedBy("settings-email", errors.contactEmail, true)} />
          </Field>
          <Field id="settings-location" label="Location" error={errors.location?.message}>
            <Input id="settings-location" {...register("location")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-line pt-6">
        <legend className="eyebrow pr-3">Social links</legend>
        <ul className="space-y-3">
          {links.fields.map((field, index) => (
            <li key={field.id} className="grid gap-3 sm:grid-cols-[11rem_1fr_auto] sm:items-start">
              <Select aria-label={`Platform ${index + 1}`} {...register(`socialLinks.${index}.platform`)}>
                {SOCIAL_PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {SOCIAL_LABELS[platform]}
                  </option>
                ))}
              </Select>
              <div>
                <Input
                  aria-label={`URL ${index + 1}`}
                  type="url"
                  placeholder="https://"
                  {...register(`socialLinks.${index}.url`)}
                  aria-invalid={Boolean(errors.socialLinks?.[index]?.url)}
                />
                {errors.socialLinks?.[index]?.url && <p className="mt-1 text-xs text-danger">{errors.socialLinks[index]?.url?.message}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => links.remove(index)} aria-label={`Remove link ${index + 1}`}>
                <Trash2 className="text-danger" />
              </Button>
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="sm" onClick={() => links.append({ platform: "instagram", url: "" })}>
          <Plus /> Add link
        </Button>
      </fieldset>

      <div className="border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
          Save settings
        </Button>
      </div>
    </form>
  );
}

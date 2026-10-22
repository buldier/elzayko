"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { MediaFormValues } from "../form-schema";

type Props = {
  form: UseFormReturn<MediaFormValues>;
  /** Object URL or derivative URL of the visual. */
  imageUrl: string | null;
  videoUrl?: string | null;
  providerLabel?: string | null;
};

/** Live "how visitors will see it" preview, updated as metadata is typed. */
export function MediaPreview({ form, imageUrl, videoUrl, providerLabel }: Props) {
  const [title, caption, altText, status, mediaType] = useWatch({
    control: form.control,
    name: ["title", "caption", "altText", "status", "mediaType"],
  });
  return (
    <figure className="rounded-md border border-line bg-surface shadow-card p-4">
      <figcaption className="eyebrow mb-3 flex items-center justify-between">
        Preview
        <span className={status === "PUBLISHED" ? "text-moss" : "text-amber"}>{status.toLowerCase()}</span>
      </figcaption>
      <div className="relative overflow-hidden bg-paper-sunk">
        {videoUrl ? (
          <video src={videoUrl} controls muted className="aspect-video w-full bg-ink" />
        ) : imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through next/image
          <img src={imageUrl} alt={altText || "Preview"} className="max-h-80 w-full object-contain" />
        ) : (
          <div className="flex aspect-[4/3] flex-col justify-between p-5">
            <span className="eyebrow inline-flex items-center gap-1 text-rosewood">
              {providerLabel ?? "Link"} <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl italic">{caption || title || "Untitled"}</span>
          </div>
        )}
        {mediaType === "VIDEO" && !videoUrl && imageUrl && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-xs bg-ink/75 px-2 py-1 text-xs text-paper">
            <Play className="size-3 fill-current" aria-hidden="true" /> {providerLabel ?? "Video"}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-xl leading-tight">{title || "Untitled"}</p>
      {caption && <p className="mt-1 text-sm text-muted">{caption}</p>}
    </figure>
  );
}

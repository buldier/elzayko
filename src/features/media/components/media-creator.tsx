"use client";

import { Link2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/admin/toaster";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { createMediaAction } from "../actions";
import { toMetadataPayload, type MediaFormValues } from "../form-schema";
import { MediaMetadataForm, type TaxonomyOption } from "./media-metadata-form";
import { MediaPreview } from "./media-preview";
import { MediaUploadDropzone, type UploadedFile } from "./media-upload-dropzone";

type Props = { categories: TaxonomyOption[]; collections: TaxonomyOption[]; initialSource?: "upload" | "external" };

const EMPTY: Omit<MediaFormValues, "mediaType"> = {
  title: "",
  slug: "",
  caption: "",
  altText: "",
  description: "",
  categoryId: "",
  collectionIds: [],
  tags: "",
  status: "DRAFT",
  featured: false,
  allowDownload: false,
  url: "",
};

function titleFromFilename(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function youtubeThumb(url: string): string | null {
  const match = /(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/.exec(url);
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export function MediaCreator({ categories, collections, initialSource = "upload" }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [source, setSource] = useState<"upload" | "external">(initialSource);
  const [upload, setUpload] = useState<UploadedFile | null>(null);
  const [poster, setPoster] = useState<UploadedFile | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(values: MediaFormValues) {
    setServerError(null);
    const metadata = toMetadataPayload(values);
    const result =
      source === "upload" && upload
        ? await createMediaAction({
            ...metadata,
            source: "upload",
            storageKey: upload.key,
            posterKey: poster?.key ?? null,
            videoMeta: upload.videoMeta,
          })
        : await createMediaAction({ ...metadata, source: "external", url: values.url, allowDownload: false });

    if (!result.ok) {
      setServerError(result.error);
      return result.fieldErrors;
    }
    toast(values.status === "PUBLISHED" ? "Published" : "Saved as draft");
    router.push(`/admin/media/${result.data.id}/edit`);
  }

  const tabClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm transition-colors",
      active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
    );

  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Media source" className="flex gap-6 border-b border-line">
        <button type="button" role="tab" aria-selected={source === "upload"} className={tabClass(source === "upload")} onClick={() => setSource("upload")}>
          <Upload className="size-4" aria-hidden="true" /> Upload a file
        </button>
        <button type="button" role="tab" aria-selected={source === "external"} className={tabClass(source === "external")} onClick={() => setSource("external")}>
          <Link2 className="size-4" aria-hidden="true" /> YouTube or external link
        </button>
      </div>

      {source === "upload" && !upload && (
        <MediaUploadDropzone accept={["image", "video"]} label="Upload an image or video" onUploaded={setUpload} />
      )}

      {source === "upload" && upload && (
        <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface shadow-card px-4 py-3 text-sm">
          <span>
            Uploaded <strong className="font-medium">{upload.file.name}</strong> — it will be verified and processed when you save.
          </span>
          <Button variant="ghost" size="sm" onClick={() => { setUpload(null); setPoster(null); }}>
            <X /> Replace
          </Button>
        </div>
      )}

      {source === "upload" && upload?.kind === "video" && (
        <div className="max-w-xl">
          {poster ? (
            <p className="text-sm text-muted">
              Poster image: {poster.file.name}{" "}
              <button type="button" className="underline" onClick={() => setPoster(null)}>
                remove
              </button>
            </p>
          ) : (
            <MediaUploadDropzone accept={["image"]} label="Optional poster image" description="Shown before playback and in the gallery." onUploaded={setPoster} compact />
          )}
        </div>
      )}

      {(source === "external" || upload) && (
        <MediaMetadataForm
          key={`${source}-${upload?.key ?? ""}`}
          defaultValues={{
            ...EMPTY,
            title: upload ? titleFromFilename(upload.file.name) : "",
            mediaType: source === "external" ? "LINK" : upload?.kind === "video" ? "VIDEO" : "IMAGE",
          }}
          categories={categories}
          collections={collections}
          canDownload={source === "upload" && upload?.kind === "image"}
          showUrl={source === "external"}
          submitLabel="Save"
          serverError={serverError}
          onSubmit={onSubmit}
          aside={(form) => (
            <MediaPreview
              form={form}
              imageUrl={source === "external" ? youtubeThumb(form.watch("url")) : upload?.kind === "image" ? upload.previewUrl : (poster?.previewUrl ?? null)}
              videoUrl={upload?.kind === "video" && !poster ? upload.previewUrl : null}
              providerLabel={source === "external" ? (youtubeThumb(form.watch("url")) ? "YouTube" : "External link") : null}
            />
          )}
        />
      )}
    </div>
  );
}

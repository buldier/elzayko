"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog";
import { useToast } from "@/components/admin/toaster";
import { deleteMediaAction, updateMediaAction } from "../actions";
import { toMetadataPayload, type MediaFormValues } from "../form-schema";
import { MediaMetadataForm, type TaxonomyOption } from "./media-metadata-form";
import { MediaPreview } from "./media-preview";
import { MediaUploadDropzone, type UploadedFile } from "./media-upload-dropzone";

type Props = {
  id: string;
  slug: string;
  defaultValues: MediaFormValues;
  categories: TaxonomyOption[];
  collections: TaxonomyOption[];
  previewImageUrl: string | null;
  providerLabel: string | null;
  isUpload: boolean;
  isPublished: boolean;
};

export function MediaEditForm({ id, slug, defaultValues, categories, collections, previewImageUrl, providerLabel, isUpload, isPublished }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [poster, setPoster] = useState<UploadedFile | null>(null);
  const isUploadedVideo = isUpload && defaultValues.mediaType === "VIDEO";

  async function onSubmit(values: MediaFormValues) {
    setServerError(null);
    const result = await updateMediaAction({
      ...toMetadataPayload(values),
      id,
      url: isUpload ? undefined : values.url,
      posterKey: poster ? poster.key : undefined,
    });
    if (!result.ok) {
      setServerError(result.error);
      return result.fieldErrors;
    }
    setPoster(null);
    toast(result.message ?? "Saved");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {isPublished && (
          <Link href={`/gallery/${slug}`} target="_blank" className="inline-flex items-center gap-1 text-muted hover:text-ink">
            View public page <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        )}
        <div className="ml-auto">
          <DeleteConfirmationDialog
            id={id}
            trigger="button"
            title="Delete media"
            description="The item and its stored files will be removed permanently. This cannot be undone."
            action={deleteMediaAction}
            onDeleted={() => router.push("/admin/media")}
          />
        </div>
      </div>

      {isUploadedVideo && (
        <div className="max-w-xl">
          <MediaUploadDropzone
            accept={["image"]}
            label={poster ? `New poster ready: ${poster.file.name}` : "Replace poster image"}
            description="Saved together with the form."
            onUploaded={setPoster}
            compact
          />
        </div>
      )}

      <MediaMetadataForm
        defaultValues={defaultValues}
        categories={categories}
        collections={collections}
        canDownload={isUpload && defaultValues.mediaType === "IMAGE"}
        showUrl={!isUpload}
        submitLabel="Save changes"
        serverError={serverError}
        onSubmit={onSubmit}
        aside={(form) => (
          <MediaPreview
            form={form}
            imageUrl={poster?.previewUrl ?? previewImageUrl}
            videoUrl={isUploadedVideo && !previewImageUrl && !poster ? `/api/media/${id}/stream` : null}
            providerLabel={providerLabel}
          />
        )}
      />
    </div>
  );
}

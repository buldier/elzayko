import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { PublishStatusBadge } from "@/components/admin/publish-status-badge";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { getTaxonomyOptions } from "@/features/media/admin-options";
import { MediaEditForm } from "@/features/media/components/media-edit-form";
import { providerLabel } from "@/features/media/providers";
import { mediaRepository } from "@/features/media/repository";
import { requireAdmin } from "@/lib/auth/session";
import { derivativeUrl } from "@/lib/storage";
import { formatBytes, formatShortDate } from "@/lib/utils/format";

export const metadata = { title: "Edit media" };

export default async function EditMediaPage({ params }: PageProps<"/admin/media/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  const [media, options] = await Promise.all([mediaRepository.findForEdit(id), getTaxonomyOptions()]);
  if (!media) notFound();

  const isUpload = media.sourceType === "UPLOAD";
  return (
    <>
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Media", href: "/admin/media" }, { label: media.title }]} />
      </div>
      <AdminPageHeader
        title={media.title}
        description={[
          isUpload ? `${media.mimeType ?? "file"}${media.fileSize ? ` · ${formatBytes(media.fileSize)}` : ""}` : providerLabel(media.provider, media.externalUrl),
          media.width && media.height ? `${media.width}×${media.height}` : null,
          `created ${formatShortDate(media.createdAt)}`,
        ]
          .filter(Boolean)
          .join(" · ")}
        action={<PublishStatusBadge status={media.status} />}
      />
      <MediaEditForm
        id={media.id}
        slug={media.slug}
        isUpload={isUpload}
        isPublished={media.status === "PUBLISHED"}
        previewImageUrl={derivativeUrl(media.displayKey) ?? media.thumbnailUrl}
        providerLabel={isUpload ? null : providerLabel(media.provider, media.externalUrl)}
        categories={options.categories}
        collections={options.collections}
        defaultValues={{
          title: media.title,
          slug: media.slug,
          caption: media.caption ?? "",
          altText: media.altText ?? "",
          description: media.description ?? "",
          categoryId: media.categoryId ?? "",
          collectionIds: media.collections.map((item) => item.collectionId),
          tags: media.tags.map(({ tag }) => tag.name).join(", "),
          status: media.status,
          featured: media.featured,
          allowDownload: media.allowDownload,
          url: media.externalUrl ?? "",
          mediaType: media.mediaType,
        }}
      />
    </>
  );
}

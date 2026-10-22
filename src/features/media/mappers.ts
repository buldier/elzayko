import "server-only";
import { IMAGE_DERIVATIVES } from "@/config/media";
import { derivativeUrl } from "@/lib/storage";
import { embedUrlFor, providerLabel } from "./providers";
import type { PublicCardRow, PublicDetailRow } from "./repository";
import type { MediaCardData, MediaDetailData, MediaImage } from "./types";

const YOUTUBE_THUMB = { width: 480, height: 360 };

function scaled(width: number | null, height: number | null, maxWidth: number) {
  const w = width ?? 1600;
  const h = height ?? 2000;
  const targetWidth = Math.min(w, maxWidth);
  return { width: targetWidth, height: Math.max(1, Math.round((h * targetWidth) / w)) };
}

function derivativeImage(row: PublicCardRow, key: string | null, maxWidth: number): MediaImage | null {
  const src = derivativeUrl(key);
  if (!src) return null;
  return { src, ...scaled(row.width, row.height, maxWidth), blurDataUrl: row.blurDataUrl };
}

function cardImage(row: PublicCardRow): MediaImage | null {
  if (row.sourceType === "UPLOAD") return derivativeImage(row, row.thumbnailKey, IMAGE_DERIVATIVES.thumb.width);
  if (row.thumbnailUrl) return { src: row.thumbnailUrl, ...YOUTUBE_THUMB, blurDataUrl: null };
  return null;
}

export function toCard(row: PublicCardRow): MediaCardData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    caption: row.caption,
    altText: row.altText ?? row.title,
    mediaType: row.mediaType,
    sourceType: row.sourceType,
    providerLabel: row.sourceType === "EXTERNAL" ? providerLabel(row.provider, row.externalUrl) : null,
    image: cardImage(row),
    preview:
      row.mediaType === "IMAGE" && row.sourceType === "UPLOAD"
        ? derivativeImage(row, row.displayKey, IMAGE_DERIVATIVES.display.width)
        : null,
    duration: row.duration,
    externalUrl: row.sourceType === "EXTERNAL" ? row.externalUrl : null,
    featured: row.featured,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    category: row.category,
  };
}

export function toDetail(row: PublicDetailRow): MediaDetailData {
  const isUpload = row.sourceType === "UPLOAD";
  const displayImage = isUpload
    ? derivativeImage(row, row.displayKey, IMAGE_DERIVATIVES.display.width)
    : row.thumbnailUrl
      ? { src: row.thumbnailUrl, ...YOUTUBE_THUMB, blurDataUrl: null }
      : null;
  return {
    ...toCard(row),
    description: row.description,
    displayImage,
    tags: row.tags.map(({ tag }) => ({ name: tag.name, slug: tag.slug })),
    collections: row.collections.map(({ collection }) => collection),
    embedUrl: embedUrlFor(row.provider, row.externalId),
    videoSrc: isUpload && row.mediaType === "VIDEO" ? `/api/media/${row.id}/stream` : null,
    videoMime: isUpload && row.mediaType === "VIDEO" ? row.mimeType : null,
    downloadUrl:
      isUpload && row.mediaType === "IMAGE" && row.allowDownload ? `/api/media/${row.id}/download` : null,
  };
}

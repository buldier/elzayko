import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { GALLERY_PAGE_SIZE } from "@/config/media";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/db/prisma";
import { toCard, toDetail } from "./mappers";
import { mediaRepository } from "./repository";
import type { GalleryFilters } from "./schemas";
import type { MediaCardData, MediaDetailData, MediaNeighbours, Paginated } from "./types";

/**
 * Public, cached reads. Every query here is restricted to PUBLISHED media by the repository,
 * and the mapped DTOs carry derivative URLs only.
 */

export async function getGalleryPage(filters: GalleryFilters): Promise<Paginated<MediaCardData>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.media, CACHE_TAGS.taxonomy);

  const { items, total } = await mediaRepository.findPublishedPage(filters, GALLERY_PAGE_SIZE);
  return {
    items: items.map(toCard),
    total,
    page: filters.page,
    pageSize: GALLERY_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE)),
  };
}

export async function getFeaturedMedia(limit = 7): Promise<MediaCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.media);

  const featured = await mediaRepository.findFeatured(limit);
  if (featured.length >= Math.min(limit, 3)) return featured.map(toCard);
  // Fall back to the latest work so the homepage never looks empty.
  return (await mediaRepository.findLatest(limit)).map(toCard);
}

export async function getLatestMedia(limit = 8): Promise<MediaCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.media);
  return (await mediaRepository.findLatest(limit)).map(toCard);
}

export type MediaDetailPage = {
  media: MediaDetailData;
  neighbours: MediaNeighbours;
  related: MediaCardData[];
};

export async function getMediaDetail(slug: string): Promise<MediaDetailPage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.media, CACHE_TAGS.taxonomy);

  const row = await mediaRepository.findPublishedBySlug(slug);
  if (!row || !row.publishedAt) return null;

  const [neighbours, related] = await Promise.all([
    mediaRepository.findNeighbours({ id: row.id, publishedAt: row.publishedAt }),
    mediaRepository.findRelated(
      { id: row.id, categoryId: row.categoryId, tagIds: row.tags.map(({ tag }) => tag.id) },
      4,
    ),
  ]);
  return { media: toDetail(row), neighbours, related: related.map(toCard) };
}

export async function getSitemapMedia(): Promise<{ slug: string; updatedAt: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.media);
  const rows = await mediaRepository.findPublishedSlugs();
  return rows.map((row) => ({ slug: row.slug, updatedAt: row.updatedAt.toISOString() }));
}

export async function getPublicStats(): Promise<{ photographs: number; films: number }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.media);
  const [photographs, films] = await Promise.all([
    prisma.media.count({ where: { status: "PUBLISHED", mediaType: "IMAGE" } }),
    prisma.media.count({ where: { status: "PUBLISHED", mediaType: "VIDEO" } }),
  ]);
  return { photographs, films };
}

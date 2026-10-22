import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AdminMediaFilters, GalleryFilters } from "./schemas";

/** Columns needed for public cards. Never includes `storageKey`. */
export const publicCardSelect = {
  id: true,
  slug: true,
  title: true,
  caption: true,
  altText: true,
  mediaType: true,
  sourceType: true,
  provider: true,
  externalUrl: true,
  thumbnailUrl: true,
  thumbnailKey: true,
  displayKey: true,
  posterKey: true,
  blurDataUrl: true,
  width: true,
  height: true,
  duration: true,
  featured: true,
  publishedAt: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.MediaSelect;

export const publicDetailSelect = {
  ...publicCardSelect,
  description: true,
  externalId: true,
  mimeType: true,
  allowDownload: true,
  categoryId: true,
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } }, orderBy: { tag: { name: "asc" } } },
  collections: {
    where: { collection: { isPublic: true } },
    select: { collection: { select: { title: true, slug: true } } },
  },
} satisfies Prisma.MediaSelect;

export type PublicCardRow = Prisma.MediaGetPayload<{ select: typeof publicCardSelect }>;
export type PublicDetailRow = Prisma.MediaGetPayload<{ select: typeof publicDetailSelect }>;

const published = { status: "PUBLISHED" } as const satisfies Prisma.MediaWhereInput;

const publicOrder: Prisma.MediaOrderByWithRelationInput[] = [{ publishedAt: "desc" }, { id: "desc" }];

function searchWhere(q: string): Prisma.MediaWhereInput {
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { caption: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
    ],
  };
}

const typeFilter = { image: "IMAGE", video: "VIDEO", link: "LINK" } as const;

export function galleryWhere(filters: GalleryFilters): Prisma.MediaWhereInput {
  const and: Prisma.MediaWhereInput[] = [published];
  if (filters.type !== "all") and.push({ mediaType: typeFilter[filters.type] });
  if (filters.category) and.push({ category: { slug: filters.category } });
  if (filters.collection) and.push({ collections: { some: { collection: { slug: filters.collection, isPublic: true } } } });
  if (filters.tag) and.push({ tags: { some: { tag: { slug: filters.tag } } } });
  if (filters.q) and.push(searchWhere(filters.q));
  return { AND: and };
}

export const mediaRepository = {
  async findPublishedPage(filters: GalleryFilters, pageSize: number) {
    const where = galleryWhere(filters);
    const [items, total] = await prisma.$transaction([
      prisma.media.findMany({
        where,
        select: publicCardSelect,
        orderBy: publicOrder,
        skip: (filters.page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.media.count({ where }),
    ]);
    return { items, total };
  },

  findFeatured(limit: number) {
    return prisma.media.findMany({
      where: { ...published, featured: true },
      select: publicCardSelect,
      orderBy: publicOrder,
      take: limit,
    });
  },

  findLatest(limit: number) {
    return prisma.media.findMany({ where: published, select: publicCardSelect, orderBy: publicOrder, take: limit });
  },

  findPublishedBySlug(slug: string) {
    return prisma.media.findFirst({ where: { ...published, slug }, select: publicDetailSelect });
  },

  /** Previous = newer item, next = older item, in public gallery order. */
  async findNeighbours(current: { id: string; publishedAt: Date }) {
    const [previous, next] = await Promise.all([
      prisma.media.findFirst({
        where: {
          ...published,
          OR: [
            { publishedAt: { gt: current.publishedAt } },
            { publishedAt: current.publishedAt, id: { gt: current.id } },
          ],
        },
        orderBy: [{ publishedAt: "asc" }, { id: "asc" }],
        select: { slug: true, title: true },
      }),
      prisma.media.findFirst({
        where: {
          ...published,
          OR: [
            { publishedAt: { lt: current.publishedAt } },
            { publishedAt: current.publishedAt, id: { lt: current.id } },
          ],
        },
        orderBy: publicOrder,
        select: { slug: true, title: true },
      }),
    ]);
    return { previous, next };
  },

  findRelated(current: { id: string; categoryId: string | null; tagIds: string[] }, limit: number) {
    const related: Prisma.MediaWhereInput[] = [];
    if (current.categoryId) related.push({ categoryId: current.categoryId });
    if (current.tagIds.length) related.push({ tags: { some: { tagId: { in: current.tagIds } } } });
    return prisma.media.findMany({
      where: { ...published, id: { not: current.id }, ...(related.length ? { OR: related } : {}) },
      select: publicCardSelect,
      orderBy: publicOrder,
      take: limit,
    });
  },

  /** Download eligibility is decided in the query itself. */
  findDownloadable(id: string) {
    return prisma.media.findFirst({
      where: { id, status: "PUBLISHED", mediaType: "IMAGE", sourceType: "UPLOAD", allowDownload: true },
      select: { id: true, slug: true, storageKey: true, mimeType: true },
    });
  },

  findStreamable(id: string, includeUnpublished: boolean) {
    return prisma.media.findFirst({
      where: {
        id,
        mediaType: "VIDEO",
        sourceType: "UPLOAD",
        ...(includeUnpublished ? { status: { not: "ARCHIVED" } } : published),
      },
      select: { storageKey: true, mimeType: true },
    });
  },

  findPublishedSlugs() {
    return prisma.media.findMany({ where: published, select: { slug: true, updatedAt: true }, orderBy: publicOrder });
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async adminList(filters: AdminMediaFilters, pageSize: number) {
    const and: Prisma.MediaWhereInput[] = [];
    if (filters.status !== "all") and.push({ status: filters.status });
    if (filters.type !== "all") and.push({ mediaType: typeFilter[filters.type] });
    if (filters.q) and.push(searchWhere(filters.q));
    const where: Prisma.MediaWhereInput = { AND: and };
    const orderBy: Prisma.MediaOrderByWithRelationInput[] = {
      newest: [{ createdAt: "desc" as const }],
      oldest: [{ createdAt: "asc" as const }],
      title: [{ title: "asc" as const }],
      updated: [{ updatedAt: "desc" as const }],
    }[filters.sort];
    const [items, total] = await prisma.$transaction([
      prisma.media.findMany({
        where,
        orderBy: [...orderBy, { id: "desc" }],
        skip: (filters.page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          mediaType: true,
          sourceType: true,
          status: true,
          featured: true,
          allowDownload: true,
          thumbnailKey: true,
          thumbnailUrl: true,
          posterKey: true,
          blurDataUrl: true,
          provider: true,
          externalUrl: true,
          updatedAt: true,
          createdAt: true,
          publishedAt: true,
          category: { select: { name: true } },
        },
      }),
      prisma.media.count({ where }),
    ]);
    return { items, total };
  },

  findForEdit(id: string) {
    return prisma.media.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        collections: { select: { collectionId: true } },
        category: { select: { id: true, name: true } },
      },
    });
  },

  async slugExists(slug: string, exceptId?: string) {
    const found = await prisma.media.findFirst({
      where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    return Boolean(found);
  },

  storageKeyInUse(key: string) {
    return prisma.media.findFirst({
      where: { OR: [{ storageKey: key }, { posterKey: key }] },
      select: { id: true },
    });
  },

  async counts() {
    const grouped = await prisma.media.groupBy({ by: ["status"], _count: { _all: true } });
    const byStatus = Object.fromEntries(grouped.map((row) => [row.status, row._count._all])) as Partial<
      Record<"DRAFT" | "PUBLISHED" | "ARCHIVED", number>
    >;
    const [featured, downloadable, categories, collections, unreadMessages] = await Promise.all([
      prisma.media.count({ where: { status: "PUBLISHED", featured: true } }),
      prisma.media.count({ where: { status: "PUBLISHED", allowDownload: true } }),
      prisma.category.count(),
      prisma.collection.count(),
      prisma.contactSubmission.count({ where: { status: "NEW" } }),
    ]);
    return {
      published: byStatus.PUBLISHED ?? 0,
      drafts: byStatus.DRAFT ?? 0,
      archived: byStatus.ARCHIVED ?? 0,
      featured,
      downloadable,
      categories,
      collections,
      unreadMessages,
    };
  },

  recent(limit: number) {
    return prisma.media.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        mediaType: true,
        sourceType: true,
        provider: true,
        updatedAt: true,
        thumbnailKey: true,
        thumbnailUrl: true,
        category: { select: { name: true } },
      },
    });
  },
};

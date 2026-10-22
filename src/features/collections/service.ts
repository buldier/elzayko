import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { IMAGE_DERIVATIVES } from "@/config/media";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/db/prisma";
import { derivativeUrl } from "@/lib/storage";
import { AppError, validationError } from "@/lib/utils/result";
import { uniqueSlug } from "@/lib/utils/slug";
import type { MediaImage } from "@/features/media/types";
import { collectionInputSchema, type CollectionInput } from "./schemas";

export type PublicCollection = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  featured: boolean;
  count: number;
  cover: (MediaImage & { alt: string }) | null;
};

const coverSelect = {
  thumbnailKey: true,
  thumbnailUrl: true,
  width: true,
  height: true,
  blurDataUrl: true,
  altText: true,
  title: true,
} satisfies Prisma.MediaSelect;

type CoverRow = Prisma.MediaGetPayload<{ select: typeof coverSelect }>;

function toCover(row: CoverRow | null | undefined): PublicCollection["cover"] {
  if (!row) return null;
  const src = derivativeUrl(row.thumbnailKey) ?? row.thumbnailUrl;
  if (!src) return null;
  const width = Math.min(row.width ?? 1600, IMAGE_DERIVATIVES.thumb.width);
  const height = row.width && row.height ? Math.round((row.height * width) / row.width) : Math.round(width * 1.25);
  return { src, width, height, blurDataUrl: row.blurDataUrl, alt: row.altText ?? row.title };
}

/** Public collections with a published cover (explicit cover, else the newest published item). */
export async function getPublicCollections(options: { featuredOnly?: boolean } = {}): Promise<PublicCollection[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.taxonomy, CACHE_TAGS.media);

  const rows = await prisma.collection.findMany({
    where: { isPublic: true, ...(options.featuredOnly ? { featured: true } : {}) },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      featured: true,
      cover: { select: { ...coverSelect, status: true } },
      items: {
        where: { media: { status: "PUBLISHED" } },
        orderBy: [{ position: "asc" }, { media: { publishedAt: "desc" } }],
        take: 1,
        select: { media: { select: coverSelect } },
      },
      _count: { select: { items: { where: { media: { status: "PUBLISHED" } } } } },
    },
  });

  return rows
    .filter((row) => row._count.items > 0)
    .map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      featured: row.featured,
      count: row._count.items,
      cover: toCover(row.cover?.status === "PUBLISHED" ? row.cover : row.items[0]?.media),
    }));
}

export function listCollectionsForAdmin() {
  return prisma.collection.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { _count: { select: { items: true } }, cover: { select: { id: true, title: true } } },
  });
}

export async function saveCollection(raw: CollectionInput) {
  const parsed = collectionInputSchema.safeParse(raw);
  if (!parsed.success) throw validationError(parsed.error.issues);
  const { id, title, description, featured, isPublic, sortOrder, coverId } = parsed.data;

  const isTaken = async (slug: string) =>
    Boolean(await prisma.collection.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } }));
  const slug = parsed.data.slug || (await uniqueSlug(title, isTaken, 140));
  if (parsed.data.slug && (await isTaken(slug))) throw new AppError("That slug is already in use", "CONFLICT");

  if (coverId) {
    const cover = await prisma.media.findUnique({ where: { id: coverId }, select: { mediaType: true } });
    if (!cover) throw new AppError("Cover media not found");
  }

  const data = { title, slug, description, featured, isPublic, sortOrder, coverId: coverId ?? null };
  try {
    return id ? await prisma.collection.update({ where: { id }, data }) : await prisma.collection.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new AppError("Collection not found", "NOT_FOUND");
    }
    throw error;
  }
}

/** Removes the collection and its memberships; the media themselves are kept. */
export async function deleteCollection(id: string) {
  const deleted = await prisma.collection.deleteMany({ where: { id } });
  if (deleted.count === 0) throw new AppError("Collection not found", "NOT_FOUND");
}

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/db/prisma";
import { AppError, validationError } from "@/lib/utils/result";
import { uniqueSlug } from "@/lib/utils/slug";
import { categoryInputSchema, type CategoryInput } from "./schemas";

export type PublicCategory = { id: string; name: string; slug: string; description: string | null; count: number };

/** Categories that have at least one published item, for public filters. */
export async function getPublicCategories(): Promise<PublicCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.taxonomy, CACHE_TAGS.media);
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { media: { where: { status: "PUBLISHED" } } } },
    },
  });
  return rows
    .filter((row) => row._count.media > 0)
    .map(({ _count, ...row }) => ({ ...row, count: _count.media }));
}

export function listCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { media: true } } },
  });
}

export async function saveCategory(raw: CategoryInput) {
  const parsed = categoryInputSchema.safeParse(raw);
  if (!parsed.success) throw validationError(parsed.error.issues);
  const { id, name, description, sortOrder } = parsed.data;

  const isTaken = async (slug: string) =>
    Boolean(await prisma.category.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } }));
  const slug = parsed.data.slug || (await uniqueSlug(name, isTaken, 100));
  if (parsed.data.slug && (await isTaken(slug))) throw new AppError("That slug is already in use", "CONFLICT");

  try {
    return id
      ? await prisma.category.update({ where: { id }, data: { name, slug, description, sortOrder } })
      : await prisma.category.create({ data: { name, slug, description, sortOrder } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new AppError("Category not found", "NOT_FOUND");
    }
    throw error;
  }
}

/** Media in the category keep existing; their category is cleared (ON DELETE SET NULL). */
export async function deleteCategory(id: string) {
  const deleted = await prisma.category.deleteMany({ where: { id } });
  if (deleted.count === 0) throw new AppError("Category not found", "NOT_FOUND");
}

import "server-only";
import { prisma } from "@/lib/db/prisma";

/** Category and collection choices for admin forms (request-time, uncached). */
export async function getTaxonomyOptions() {
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }], select: { id: true, title: true } }),
  ]);
  return {
    categories: categories.map((category) => ({ id: category.id, label: category.name })),
    collections: collections.map((collection) => ({ id: collection.id, label: collection.title })),
  };
}

/** Uploaded images that can be used as covers or portraits. */
export async function getImageOptions() {
  const rows = await prisma.media.findMany({
    where: { mediaType: "IMAGE", sourceType: "UPLOAD", status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: { id: true, title: true, status: true },
  });
  return rows.map((row) => ({ id: row.id, label: row.status === "PUBLISHED" ? row.title : `${row.title} (${row.status.toLowerCase()})` }));
}

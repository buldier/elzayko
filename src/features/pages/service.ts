import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/db/prisma";
import { validationError } from "@/lib/utils/result";
import { PAGE_DEFAULTS } from "./defaults";
import { PAGE_SCHEMAS, type PageContent, type PageSlug } from "./schemas";

export type PageData<S extends PageSlug> = { title: string; content: PageContent<S>; updatedAt: string | null };

/** Reads a page, validating stored JSON and falling back to defaults for missing or invalid content. */
export async function getPage<S extends PageSlug>(slug: S): Promise<PageData<S>> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.pages);

  const row = await prisma.page.findUnique({ where: { slug } });
  const fallback = PAGE_DEFAULTS[slug];
  if (!row) return { title: fallback.title, content: fallback.content, updatedAt: null };

  const parsed = PAGE_SCHEMAS[slug].safeParse(row.content);
  return {
    title: row.title,
    content: (parsed.success ? parsed.data : fallback.content) as PageContent<S>,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function savePage(slug: PageSlug, title: string, rawContent: unknown) {
  const parsed = PAGE_SCHEMAS[slug].safeParse(rawContent);
  if (!parsed.success) throw validationError(parsed.error.issues);
  const cleanTitle = title.trim().slice(0, 160) || PAGE_DEFAULTS[slug].title;
  const content = parsed.data as Prisma.InputJsonValue;
  return prisma.page.upsert({
    where: { slug },
    create: { slug, title: cleanTitle, content },
    update: { title: cleanTitle, content },
  });
}

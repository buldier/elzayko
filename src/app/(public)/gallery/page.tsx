import { ImageOff } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { MediaFilters } from "@/components/gallery/media-filters";
import { MediaGrid } from "@/components/gallery/media-grid";
import { Pagination } from "@/components/gallery/pagination";
import { EmptyState, MediaGridSkeleton, Skeleton } from "@/components/feedback/states";
import { ButtonLink } from "@/components/ui/button";
import { getPublicCategories } from "@/features/categories/service";
import { getPublicCollections } from "@/features/collections/service";
import { galleryHref } from "@/features/media/gallery-url";
import { getGalleryPage } from "@/features/media/queries";
import { parseGalleryFilters } from "@/features/media/schemas";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs, films and links — the complete Elzayko archive, searchable by category, collection and tag.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  return (
    <div className="page-container pt-10 pb-24 md:pt-16">
      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="eyebrow mb-4">Archive</p>
          <h1 className="text-display">Gallery</h1>
        </div>
        <p className="max-w-md text-lg text-ink-soft md:col-span-5 md:justify-self-end">
          Everything published, newest first. Filter by kind of work, browse a series, or search by subject.
        </p>
      </header>
      <Suspense fallback={<GalleryFallback />}>
        <GalleryResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function GalleryResults({ searchParams }: Pick<PageProps<"/gallery">, "searchParams">) {
  const filters = parseGalleryFilters(await searchParams);
  const [page, categories, collections] = await Promise.all([
    getGalleryPage(filters),
    getPublicCategories(),
    getPublicCollections(),
  ]);
  const filtered = Boolean(filters.q || filters.category || filters.collection || filters.tag || filters.type !== "all");

  return (
    <>
      <MediaFilters
        filters={filters}
        categories={categories.map((category) => ({ slug: category.slug, label: category.name }))}
        collections={collections.map((collection) => ({ slug: collection.slug, label: collection.title }))}
      />
      <p className="mt-8 mb-6 text-sm text-muted" role="status" aria-live="polite">
        {page.total === 0
          ? "No results"
          : `${page.total} ${page.total === 1 ? "work" : "works"}${page.pageCount > 1 ? ` · page ${page.page} of ${page.pageCount}` : ""}`}
      </p>
      {page.items.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title={filtered ? "Nothing matches those filters" : "No work published yet"}
          description={filtered ? "Try a different search, or clear the filters to see everything." : "Please check back soon."}
          action={
            filtered ? (
              <ButtonLink href="/gallery" variant="secondary">
                Clear filters
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <>
          <MediaGrid items={page.items} priorityCount={filters.page === 1 ? 3 : 0} />
          <div className="mt-12">
            <Pagination
              page={page.page}
              pageCount={page.pageCount}
              hrefFor={(target) => galleryHref({ ...filters, page: target })}
            />
          </div>
        </>
      )}
    </>
  );
}

function GalleryFallback() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-3 md:grid-cols-[1fr_14rem_14rem]">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <MediaGridSkeleton />
    </div>
  );
}

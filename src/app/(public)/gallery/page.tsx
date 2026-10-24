import type { Metadata } from "next";
import { Suspense } from "react";
import { MediaFilters } from "@/components/gallery/media-filters";
import { MediaGrid } from "@/components/gallery/media-grid";
import { MediaGridSkeleton, Skeleton } from "@/components/feedback/states";
import { CtaBand } from "@/components/site/cta-band";
import { GalleryCollage } from "@/components/site/gallery-collage";
import { PageBanner } from "@/components/site/page-banner";
import { SiteEmptyState } from "@/components/site/site-empty-state";
import { SitePagination } from "@/components/site/site-pagination";
import { getPublicCategories } from "@/features/categories/service";
import { getPublicCollections } from "@/features/collections/service";
import { galleryHref } from "@/features/media/gallery-url";
import { getFeaturedMedia, getGalleryPage } from "@/features/media/queries";
import { parseGalleryFilters } from "@/features/media/schemas";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs, films and links — the complete Elzayko archive, searchable by category, collection and tag.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  return (
    <>
      <PageBanner title="Gallery" crumbs={[{ label: "Gallery" }]} featuredIndex={1} />
      <div className="relative z-[1] py-[60px] md:py-[80px] lg:py-[100px] xl:py-[120px]">
        <Suspense fallback={<GalleryFallback />}>
          <GalleryResults searchParams={searchParams} />
        </Suspense>
      </div>
      <CtaBand
        title="Download high-quality photos"
        text="Many photographs can be downloaded for personal use. For prints, licensing or commissions, get in touch."
        action={{ href: "/contact", label: "Ask about prints" }}
      />
    </>
  );
}

async function GalleryResults({ searchParams }: Pick<PageProps<"/gallery">, "searchParams">) {
  const filters = parseGalleryFilters(await searchParams);
  const [page, categories, collections, featured] = await Promise.all([
    getGalleryPage(filters),
    getPublicCategories(),
    getPublicCollections(),
    getFeaturedMedia(8),
  ]);
  const filtered = Boolean(filters.q || filters.category || filters.collection || filters.tag || filters.type !== "all");
  const showCollage = !filtered && filters.page === 1 && featured.filter((item) => item.preview ?? item.image).length >= 8;

  return (
    <>
      {showCollage && (
        <div className="mb-[40px] md:mb-[60px] lg:mb-[80px] xl:mb-[100px]">
          <GalleryCollage items={featured} />
        </div>
      )}
      <div className="container">
        <MediaFilters
          filters={filters}
          categories={categories.map((category) => ({ slug: category.slug, label: category.name }))}
          collections={collections.map((collection) => ({ slug: collection.slug, label: collection.title }))}
        />
        <p className="mt-[25px] mb-[25px] text-[#a0a0a0]" role="status" aria-live="polite">
          {page.total === 0
            ? "No results"
            : `${page.total} ${page.total === 1 ? "work" : "works"}${page.pageCount > 1 ? ` · page ${page.page} of ${page.pageCount}` : ""}`}
        </p>
      </div>
      {page.items.length === 0 ? (
        <SiteEmptyState
          title={filtered ? "Nothing matches those filters" : "No work published yet"}
          description={filtered ? "Try a different search, or clear the filters to see everything." : "Please check back soon."}
          action={filtered ? { href: "/gallery", label: "Clear filters" } : undefined}
        />
      ) : (
        <div className="container">
          <MediaGrid items={page.items} priorityCount={filters.page === 1 && !showCollage ? 3 : 0} />
          <div className="mt-[40px] md:mt-[60px]">
            <SitePagination page={page.page} pageCount={page.pageCount} hrefFor={(target) => galleryHref({ ...filters, page: target })} />
          </div>
        </div>
      )}
    </>
  );
}

function GalleryFallback() {
  return (
    <div className="container space-y-8 opacity-20">
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

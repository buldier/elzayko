"use client";

import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { galleryHref } from "@/features/media/gallery-url";
import type { GalleryFilters } from "@/features/media/schemas";
import { cn } from "@/lib/utils/cn";

type Option = { slug: string; label: string };

type Props = {
  filters: GalleryFilters;
  categories: Option[];
  collections: Option[];
};

const TYPES = [
  { value: "all", label: "All work" },
  { value: "image", label: "Photographs" },
  { value: "video", label: "Films" },
  { value: "link", label: "Elsewhere" },
] as const;

/**
 * Gallery filters. The search box is a GET <Form> (works without JavaScript);
 * selects navigate immediately when changed.
 */
export function MediaFilters({ filters, categories, collections }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const base = { ...filters, page: 1 };
  const hasFilters = Boolean(filters.q || filters.category || filters.collection || filters.tag || filters.type !== "all");

  function navigate(next: Partial<GalleryFilters>) {
    startTransition(() => router.push(galleryHref({ ...base, ...next }), { scroll: false }));
  }

  return (
    <div className="space-y-[25px]" aria-busy={pending}>
      <nav aria-label="Filter by type" className="overflow-x-auto">
        <ul className="flex min-w-max flex-wrap gap-[10px] md:gap-[15px]">
          {TYPES.map((type) => {
            const active = filters.type === type.value;
            return (
              <li key={type.value}>
                <Link
                  href={galleryHref({ ...base, type: type.value })}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn("primary-btn", !active && "with-border border-white/30")}
                >
                  {type.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid gap-[15px] md:grid-cols-[1fr_14rem_14rem] md:gap-[20px]">
        <Form action="/gallery" scroll={false} role="search" className="relative">
          {filters.type !== "all" && <input type="hidden" name="type" value={filters.type} />}
          {filters.category && <input type="hidden" name="category" value={filters.category} />}
          {filters.collection && <input type="hidden" name="collection" value={filters.collection} />}
          <label htmlFor="gallery-search" className="sr-only">
            Search by title, caption or tag
          </label>
          <RiSearchLine className="pointer-events-none absolute top-1/2 left-[15px] size-5 -translate-y-1/2 text-[#a0a0a0] md:left-[20px]" aria-hidden="true" />
          <input
            id="gallery-search"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search titles, captions, tags…"
            maxLength={100}
            className="form-input pr-[110px] pl-[45px] md:pl-[50px]"
          />
          <button type="submit" className="primary-btn absolute top-[5px] right-[5px] bottom-[5px] !py-0">
            Search
          </button>
        </Form>

        <div>
          <label htmlFor="gallery-category" className="sr-only">
            Category
          </label>
          <select id="gallery-category" className="form-select" value={filters.category} onChange={(event) => navigate({ category: event.target.value })}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="gallery-collection" className="sr-only">
            Collection
          </label>
          <select id="gallery-collection" className="form-select" value={filters.collection} onChange={(event) => navigate({ collection: event.target.value })}>
            <option value="">All collections</option>
            {collections.map((collection) => (
              <option key={collection.slug} value={collection.slug}>
                {collection.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-[10px]">
          {filters.q && <FilterChip label={`“${filters.q}”`} href={galleryHref({ ...base, q: "" })} />}
          {filters.tag && <FilterChip label={`#${filters.tag}`} href={galleryHref({ ...base, tag: "" })} />}
          <Link href="/gallery" scroll={false} className="font-medium text-primary hover:underline">
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      className="inline-flex items-center gap-[5px] rounded-[50px] border border-primary bg-white/10 px-[12px] py-[5px] text-sm text-white hover:bg-primary"
      aria-label={`Remove filter ${label}`}
    >
      {label}
      <RiCloseLine className="size-4" aria-hidden="true" />
    </Link>
  );
}

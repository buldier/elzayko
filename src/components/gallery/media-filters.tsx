"use client";

import { Search, X } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/form-controls";
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
    <div className="space-y-6" aria-busy={pending}>
      <nav aria-label="Filter by type" className="-mx-(--gutter) overflow-x-auto px-(--gutter)">
        <ul className="flex min-w-max gap-7 border-b border-line">
          {TYPES.map((type) => {
            const active = filters.type === type.value;
            return (
              <li key={type.value}>
                <Link
                  href={galleryHref({ ...base, type: type.value })}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px inline-block border-b py-3 text-sm tracking-wide transition-colors duration-(--duration-fast)",
                    active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  {type.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid gap-3 md:grid-cols-[1fr_14rem_14rem]">
        <Form action="/gallery" scroll={false} role="search" className="relative">
          {filters.type !== "all" && <input type="hidden" name="type" value={filters.type} />}
          {filters.category && <input type="hidden" name="category" value={filters.category} />}
          {filters.collection && <input type="hidden" name="collection" value={filters.collection} />}
          <label htmlFor="gallery-search" className="sr-only">
            Search by title, caption or tag
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="gallery-search"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search titles, captions, tags…"
            maxLength={100}
            className="h-11 w-full rounded-sm border border-line-strong bg-paper-raised pr-24 pl-10 text-[0.95rem] placeholder:text-faint focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-rosewood/25 focus-visible:outline-none"
          />
          <button type="submit" className="absolute top-1 right-1 h-9 rounded-xs bg-ink px-3.5 text-xs font-medium tracking-wide text-paper hover:bg-ink-soft">
            Search
          </button>
        </Form>

        <div>
          <label htmlFor="gallery-category" className="sr-only">
            Category
          </label>
          <Select id="gallery-category" value={filters.category} onChange={(event) => navigate({ category: event.target.value })}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="gallery-collection" className="sr-only">
            Collection
          </label>
          <Select id="gallery-collection" value={filters.collection} onChange={(event) => navigate({ collection: event.target.value })}>
            <option value="">All collections</option>
            {collections.map((collection) => (
              <option key={collection.slug} value={collection.slug}>
                {collection.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {filters.q && <FilterChip label={`“${filters.q}”`} href={galleryHref({ ...base, q: "" })} />}
          {filters.tag && <FilterChip label={`#${filters.tag}`} href={galleryHref({ ...base, tag: "" })} />}
          <Link href="/gallery" scroll={false} className="ml-1 text-muted underline-offset-4 hover:text-ink hover:underline">
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
      className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper-raised py-1 pr-2 pl-3 text-ink-soft hover:border-ink"
      aria-label={`Remove filter ${label}`}
    >
      {label}
      <X className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

import type { GalleryFilters } from "./schemas";

/** Builds a /gallery URL from filters, omitting defaults. Shared by server and client code. */
export function galleryHref(filters: Partial<GalleryFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.collection) params.set("collection", filters.collection);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `/gallery?${query}` : "/gallery";
}

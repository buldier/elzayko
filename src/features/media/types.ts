import type { MediaStatus, MediaType, SourceType } from "@/generated/prisma/enums";

export type { MediaStatus, MediaType, SourceType };

export type MediaImage = {
  src: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
};

export type TaxonomyRef = { name: string; slug: string };

/** Serializable shape for public cards, grids and the lightbox. Contains no storage keys. */
export type MediaCardData = {
  id: string;
  slug: string;
  title: string;
  caption: string | null;
  altText: string;
  mediaType: MediaType;
  sourceType: SourceType;
  providerLabel: string | null;
  /** Card-sized image (thumbnail derivative or provider thumbnail). */
  image: MediaImage | null;
  /** Large image for the lightbox (display derivative); null for non-images. */
  preview: MediaImage | null;
  duration: number | null;
  externalUrl: string | null;
  featured: boolean;
  publishedAt: string | null;
  category: TaxonomyRef | null;
};

export type MediaDetailData = MediaCardData & {
  description: string | null;
  displayImage: MediaImage | null;
  tags: TaxonomyRef[];
  collections: { title: string; slug: string }[];
  embedUrl: string | null;
  videoSrc: string | null;
  videoMime: string | null;
  downloadUrl: string | null;
};

export type MediaNeighbours = {
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

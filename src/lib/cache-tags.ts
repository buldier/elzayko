/** Cache tags shared by `cacheTag` readers and `updateTag`/`revalidateTag` writers. */
export const CACHE_TAGS = {
  media: "media",
  taxonomy: "taxonomy",
  pages: "pages",
  settings: "settings",
} as const;

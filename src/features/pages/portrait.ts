import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { IMAGE_DERIVATIVES } from "@/config/media";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/db/prisma";
import { derivativeUrl } from "@/lib/storage";
import type { MediaImage } from "@/features/media/types";

/** Resolves the About portrait (an uploaded image chosen by the admin) to a public derivative. */
export async function getPortrait(mediaId: string | null): Promise<(MediaImage & { alt: string }) | null> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.media, CACHE_TAGS.pages);
  if (!mediaId) return null;
  const media = await prisma.media.findFirst({
    where: { id: mediaId, mediaType: "IMAGE", sourceType: "UPLOAD", status: { not: "ARCHIVED" } },
    select: { displayKey: true, width: true, height: true, blurDataUrl: true, altText: true, title: true },
  });
  const src = derivativeUrl(media?.displayKey);
  if (!media || !src) return null;
  const width = Math.min(media.width ?? 1600, IMAGE_DERIVATIVES.display.width);
  const height = media.width && media.height ? Math.round((media.height * width) / media.width) : Math.round(width * 1.25);
  return { src, width, height, blurDataUrl: media.blurDataUrl, alt: media.altText ?? media.title };
}

"use client";

import { Expand } from "lucide-react";
import { useMemo, useState } from "react";
import { MediaCard } from "@/components/media/media-card";
import { MediaLightbox } from "@/components/media/media-lightbox";
import type { MediaCardData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  items: MediaCardData[];
  /** Number of leading items whose images are preloaded (above the fold). */
  priorityCount?: number;
  className?: string;
};

/**
 * Masonry gallery using CSS columns (images keep their natural proportions).
 * Images get a "quick view" button that opens the keyboard-navigable lightbox;
 * the card itself links to the shareable detail page.
 */
export function MediaGrid({ items, priorityCount = 3, className }: Props) {
  const images = useMemo(() => items.filter((item) => item.preview), [items]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <ul className={cn("columns-1 gap-5 min-[480px]:columns-2 lg:columns-3 3xl:columns-4", className)}>
        {items.map((item, index) => {
          const imageIndex = images.indexOf(item);
          return (
            <li key={item.id} className="relative mb-8 break-inside-avoid">
              <MediaCard media={item} priority={index < priorityCount} />
              {imageIndex >= 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(imageIndex)}
                  className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-paper/85 text-ink opacity-100 shadow-sm backdrop-blur-sm transition-opacity duration-(--duration-fast) hover:bg-paper focus-visible:opacity-100 sm:opacity-0 sm:[li:hover_&]:opacity-100"
                  aria-label={`Quick view: ${item.title}`}
                >
                  <Expand className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <MediaLightbox items={images} index={lightboxIndex} onIndexChange={setLightboxIndex} />
    </>
  );
}

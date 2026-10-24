"use client";

import { RiFullscreenLine } from "@remixicon/react";
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
 * Three-column gallery grid in the template's layout. Images get a "quick view"
 * button that opens the keyboard-navigable lightbox; the card links to the detail page.
 */
export function MediaGrid({ items, priorityCount = 3, className }: Props) {
  const images = useMemo(() => items.filter((item) => item.preview), [items]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <ul className={cn("grid grid-cols-1 gap-[25px] sm:grid-cols-2 lg:grid-cols-3", className)}>
        {items.map((item, index) => {
          const imageIndex = images.indexOf(item);
          return (
            <li key={item.id} className="relative">
              <MediaCard media={item} priority={index < priorityCount} />
              {imageIndex >= 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(imageIndex)}
                  className="absolute top-[10px] right-[10px] inline-flex size-[45px] items-center justify-center rounded-full bg-white text-black opacity-100 transition-all duration-300 ease-in-out hover:bg-primary hover:text-white focus-visible:opacity-100 sm:opacity-0 sm:[li:hover_&]:opacity-100"
                  aria-label={`Quick view: ${item.title}`}
                >
                  <RiFullscreenLine className="size-5" aria-hidden="true" />
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

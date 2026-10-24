"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import type { MediaCardData } from "@/features/media/types";
import { MediaImage } from "./media-image";

type Props = {
  items: MediaCardData[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

/**
 * Full-screen image viewer on a modal <dialog> (focus trap, Esc, inert page).
 * Arrow keys / Home / End move between images; focus returns to the trigger on close.
 */
export function MediaLightbox({ items, index, onIndexChange }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const current = index !== null ? items[index] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (current && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!current && dialog.open) {
      dialog.close();
    }
  }, [current]);

  const go = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  function onKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowRight") go(1);
    else if (event.key === "ArrowLeft") go(-1);
    else if (event.key === "Home") onIndexChange(0);
    else if (event.key === "End") onIndexChange(items.length - 1);
    else return;
    event.preventDefault();
  }

  function onClose() {
    onIndexChange(null);
    returnFocusRef.current?.focus();
  }

  const image = current?.preview ?? current?.image;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={onKeyDown}
      aria-label={current ? `${current.title} — image ${index! + 1} of ${items.length}` : "Image viewer"}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-paper open:animate-fade-in"
    >
      {current && image && (
        <div className="grid h-full grid-rows-[auto_1fr_auto]">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-xs tracking-[0.18em] text-paper/70 uppercase" aria-live="polite">
              {index! + 1} / {items.length}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-full text-paper hover:bg-paper/10"
              aria-label="Close viewer"
              autoFocus
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative flex min-h-0 items-center justify-center px-2 sm:px-16">
            <div key={current.id} className="relative h-full w-full animate-fade-in">
              <MediaImage image={image} alt={current.altText} sizes="100vw" mode="fill" className="!object-contain" />
            </div>
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-2 inline-flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition-all duration-300 hover:border-primary hover:bg-primary sm:left-4"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="size-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-2 inline-flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition-all duration-300 hover:border-primary hover:bg-primary sm:right-4"
                  aria-label="Next image"
                >
                  <ArrowRight className="size-5" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <p className="font-body text-2xl font-bold text-white">{current.title}</p>
              {current.caption && <p className="mt-1 max-w-2xl text-sm text-paper/70">{current.caption}</p>}
            </div>
            <Link
              href={`/gallery/${current.slug}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm text-paper/90 underline-offset-4 hover:underline"
            >
              View details <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}

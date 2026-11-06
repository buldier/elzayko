"use client";

import { RiArrowLeftSLine, RiArrowRightSLine, RiDoubleQuotesL } from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export type Note = { quote: string; title: string; meta: string; href: string };

/** One note at a time, cross-fading between them — the template's testimonial slider. */
export function NotesSlider({ notes }: { notes: Note[] }) {
  const [index, setIndex] = useState(0);
  if (notes.length === 0) return null;
  const go = (step: number) => setIndex((i) => (i + step + notes.length) % notes.length);

  return (
    <div className="relative pl-0 sm:pl-6">
      <RiDoubleQuotesL className="mb-4 size-7 text-primary" aria-hidden="true" />
      <div className="grid" aria-live="polite">
        {notes.map((note, i) => (
          <figure
            key={note.href}
            aria-hidden={i !== index}
            className={cn(
              "col-start-1 row-start-1 transition-all duration-700 ease-[var(--ease-out-soft)]",
              i === index
                ? "visible translate-y-0 opacity-100"
                : "invisible translate-y-3 opacity-0",
            )}
          >
            <blockquote className="text-[clamp(1.25rem,2.4vw,1.6rem)] leading-snug tracking-[-0.02em] text-white/85">
              {note.quote}
            </blockquote>
            <figcaption className="mt-8 text-sm">
              <Link
                href={note.href}
                tabIndex={i === index ? 0 : -1}
                className="block font-medium text-white/85 hover:text-primary"
              >
                {note.title}
              </Link>
              <span className="text-white/45">{note.meta}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <p className="!mb-0 font-mono text-sm text-white/55">
          {index + 1}/{notes.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous note"
            className="grid size-9 place-items-center rounded-full bg-white/[0.06] text-white/70 hover:text-primary"
          >
            <RiArrowLeftSLine className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next note"
            className="grid size-9 place-items-center rounded-full bg-white/[0.06] text-white/70 hover:text-primary"
          >
            <RiArrowRightSLine className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { RiAddLine, RiArrowRightUpLine, RiSubtractLine } from "@remixicon/react";
import Link from "next/link";
import { useId, useState } from "react";
import { ScrubIn } from "@/components/isak/motion/reveal";
import { MediaImage } from "@/components/media/media-image";
import type { MediaImage as MediaImageData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";

export type AccordionCollection = {
  title: string;
  href: string;
  description: string | null;
  count: number;
  featured: boolean;
  images: (MediaImageData & { alt: string })[];
};

/** Expandable list in the template's services style: big title row, then a fanned image strip, chips and copy. */
export function CollectionAccordion({ items }: { items: AccordionCollection[] }) {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <ul>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <ScrubIn as="li" key={item.href} className="border-b border-white/[0.06] last:border-b-0">
            <h3 className="!mb-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="group flex w-full items-center justify-between gap-6 py-7 text-left"
              >
                <span
                  className={cn(
                    "text-[clamp(1.6rem,3.2vw,2.25rem)] tracking-[-0.03em] transition-colors",
                    isOpen ? "text-white/90" : "text-white/60 group-hover:text-white/85",
                  )}
                >
                  {item.title}
                </span>
                <span className="grid size-8 flex-none place-items-center rounded-full border border-white/10 text-white/70 transition-colors group-hover:border-primary group-hover:text-primary">
                  {isOpen ? (
                    <RiSubtractLine className="size-4" aria-hidden="true" />
                  ) : (
                    <RiAddLine className="size-4" aria-hidden="true" />
                  )}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-label={item.title}
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-soft)]",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="pb-8">
                  {item.images.length > 0 && (
                    <div className="relative mb-6 h-[170px] max-w-[440px] sm:h-[210px]">
                      {item.images.slice(0, 3).map((image, n) => (
                        <div
                          key={`${image.src}-${n}`}
                          className="absolute top-0 h-full w-[60%] overflow-hidden rounded-[14px] border-[3px] border-[#1c1c1c] shadow-[0_20px_40px_-15px_rgb(0_0_0/0.9)]"
                          style={{ left: `${n * 20}%`, zIndex: n + 1 }}
                        >
                          <MediaImage image={image} alt={image.alt} sizes="280px" mode="fill" />
                        </div>
                      ))}
                    </div>
                  )}
                  <ul className="mb-4 flex flex-wrap gap-2">
                    <li className="rounded-full bg-white/[0.06] px-3 py-1 text-sm font-medium text-white/75">
                      {item.count} {item.count === 1 ? "work" : "works"}
                    </li>
                    {item.featured && (
                      <li className="rounded-full bg-white/[0.06] px-3 py-1 text-sm font-medium text-white/75">
                        Featured series
                      </li>
                    )}
                    <li className="rounded-full bg-white/[0.06] px-3 py-1 text-sm font-medium text-white/75">
                      Collection
                    </li>
                  </ul>
                  {item.description && (
                    <p className="max-w-[560px] text-white/55">{item.description}</p>
                  )}
                  <Link
                    href={item.href}
                    className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary hover:underline"
                  >
                    Browse the series <RiArrowRightUpLine className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrubIn>
        );
      })}
    </ul>
  );
}

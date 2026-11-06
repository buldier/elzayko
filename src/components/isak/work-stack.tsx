"use client";

import { RiArrowRightUpLine } from "@remixicon/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MediaImage } from "@/components/media/media-image";
import type { MediaImage as MediaImageData } from "@/features/media/types";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

export type WorkItem = {
  href: string;
  title: string;
  caption: string | null;
  image: MediaImageData;
  alt: string;
  year: string | null;
  kind: string;
  tags: string[];
};

const STICKY_TOP = 132;

/**
 * Work highlights. Each card sticks below the top edge while the next slides over it
 * (desktop). While the list is pinned, the profile card on the left steps aside and a
 * details panel for the current card takes its place.
 */
export function WorkStack({ items }: { items: WorkItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useGSAP(
    () => {
      setMounted(true);
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-work-card]", el);
      if (cards.length === 0) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const html = document.documentElement;
        const whole = ScrollTrigger.create({
          trigger: cards[0],
          start: `top ${STICKY_TOP}px`,
          endTrigger: cards[cards.length - 1],
          end: "bottom 68px",
          onToggle: (self) => {
            if (self.isActive) html.setAttribute("data-work", "");
            else html.removeAttribute("data-work");
          },
        });
        const each = cards.map((card, i) =>
          ScrollTrigger.create({
            trigger: card,
            start: `top ${STICKY_TOP}px`,
            end: "bottom 68px",
            onToggle: (self) =>
              setActive((current) => (self.isActive ? i : current === i ? null : current)),
          }),
        );
        return () => {
          whole.kill();
          each.forEach((t) => t.kill());
          html.removeAttribute("data-work");
          setActive(null);
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid">
      {items.map((item) => (
        <div
          key={item.href}
          data-work-card
          className="py-3 first:pt-0 last:pb-0 lg:sticky lg:py-8"
          style={{ top: STICKY_TOP }}
        >
          <Link
            href={item.href}
            className="group block overflow-hidden rounded-[20px] bg-[#161616] p-1.5 ring-1 ring-white/5"
          >
            <span className="relative block aspect-[700/427] overflow-hidden rounded-[15px]">
              <MediaImage
                image={item.image}
                alt={item.alt}
                sizes="(min-width: 1024px) 720px, 100vw"
                mode="fill"
                className="transition-transform duration-[1.5s] ease-[cubic-bezier(0,0,0.44,1.18)] group-hover:scale-105"
              />
            </span>
            {/* Visible below lg; on desktop the side panel carries these details. */}
            <span className="block px-3 pt-4 pb-2 lg:sr-only">
              <span className="block text-xl font-medium text-white/90">{item.title}</span>
              <span className="mt-1 block text-sm text-white/55">
                {[item.kind, item.year].filter(Boolean).join(" · ")}
              </span>
            </span>
          </Link>
        </div>
      ))}

      {mounted &&
        createPortal(
          // Decorative duplicate of the card details; the card itself is the accessible link.
          <div aria-hidden="true" className="theme-isak">
            {items.map((item, i) => (
              <WorkPanel
                key={item.href}
                item={item}
                index={i}
                total={items.length}
                visible={active === i}
              />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

function WorkPanel({
  item,
  index,
  total,
  visible,
}: {
  item: WorkItem;
  index: number;
  total: number;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed top-4 bottom-4 left-4 z-40 hidden w-full max-w-[400px] items-center transition-all duration-300 ease-out min-[1440px]:max-w-[480px] min-[1600px]:left-12 lg:flex",
        visible ? "visible translate-y-0 opacity-100" : "invisible -translate-y-10 opacity-0",
      )}
    >
      <div className="relative h-[calc(100vh-48px)] max-h-[860px] w-full rounded-[24px] bg-[#161616] p-1.5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)]">
        <div className="relative h-full overflow-hidden rounded-[18px]">
          <MediaImage image={item.image} alt="" sizes="480px" mode="fill" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/90" />
          <div className="absolute inset-0 flex flex-col justify-between p-8 xl:p-10">
            <div>
              <span className="mb-6 grid size-10 place-items-center rounded-full bg-white/10 font-display text-lg text-white backdrop-blur">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="!mb-3 text-4xl !font-medium tracking-[-0.02em] !text-white/80">
                {item.title}
              </h3>
              {item.caption && <p className="max-w-[90%] text-sm text-white/55">{item.caption}</p>}
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="grid gap-1">
                  <span className="text-sm text-white/55">Year</span>
                  <span className="text-lg text-white/75">{item.year ?? "—"}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-sm text-white/55">Medium</span>
                  <span className="text-lg text-white/75">{item.kind}</span>
                </div>
              </div>
              {item.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/75 backdrop-blur"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="mb-8 h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <Link href={item.href} tabIndex={-1} className="isak-pill">
                  <span className="isak-pill-icon">
                    <RiArrowRightUpLine className="size-4" />
                  </span>
                  View work
                </Link>
                <p className="!mb-0 text-white/40">
                  <span className="text-white/75">{String(index + 1).padStart(2, "0")}</span> /{" "}
                  {String(total).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

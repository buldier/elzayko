"use client";

import Link from "next/link";
import { useRef } from "react";
import { MediaImage } from "@/components/media/media-image";
import type { MediaImage as MediaImageData } from "@/features/media/types";
import { gsap, onLoaded, prefersReducedMotion, useGSAP } from "@/lib/motion";

export type FanItem = { href: string; title: string; image: MediaImageData; alt: string };

const CARD = 150;
// Diagonal spread, outermost cards furthest from the centre (desktop / phone).
const SPREAD = { x: [225, 135, 45], y: [150, 90, 30] };
const SPREAD_SM = { x: [95, 57, 19], y: [120, 72, 24] };

/**
 * Small square cards gather in the middle of the stage, then fan out along a
 * diagonal with a slight 3D tilt; reverses when scrolled back above.
 */
export function FlipFan({ items }: { items: FanItem[] }) {
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = stage.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-fan-card]", el);
      const n = cards.length;
      if (prefersReducedMotion()) return void gsap.set(cards, { opacity: 1 });

      const offset = (i: number, axis: "x" | "y") => {
        const table = (window.innerWidth < 575 ? SPREAD_SM : SPREAD)[axis];
        const fromCentre = i - (n - 1) / 2; // e.g. -2.5 … 2.5 for six cards
        const step = table[Math.min(Math.floor(Math.abs(fromCentre)), table.length - 1)] ?? 0;
        return Math.sign(fromCentre) * step;
      };
      const cx = () => el.clientWidth / 2 - CARD / 2;
      const cy = () => el.clientHeight / 2 - CARD / 2;

      gsap.set(cards, { x: 0, y: 0, opacity: 0 });
      let tl: gsap.core.Timeline | undefined;
      const build = contextSafe!(() => {
        tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        });
        tl.to(cards, { x: cx, y: cy, opacity: 1, duration: 1, stagger: 0.1 }).to(cards, {
          x: (i) => cx() + offset(i, "x"),
          y: (i) => cy() + offset(i, "y"),
          rotation: -10,
          rotationX: 4,
          rotationY: 10,
          duration: 1,
          ease: "power2.out",
          delay: 0.3,
        });
      });
      const off = onLoaded(build);
      return () => {
        off();
        tl?.kill();
      };
    },
    { scope: stage },
  );

  return (
    <div ref={stage} className="relative h-[460px] [perspective:1000px] sm:h-[480px]">
      {items.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          data-fan-card
          aria-label={item.title}
          className="absolute top-0 left-0 block size-[150px] opacity-0 overflow-hidden rounded-[6px] shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)] ring-1 ring-white/10"
          style={{ zIndex: i + 1 }}
        >
          <MediaImage image={item.image} alt={item.alt} sizes="150px" mode="fill" />
        </Link>
      ))}
    </div>
  );
}

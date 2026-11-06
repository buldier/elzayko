"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, onLoaded, prefersReducedMotion, SplitText, useGSAP } from "@/lib/motion";

type FadeVariant = "up" | "down" | "left" | "right" | "zoom";

const FADE_FROM: Record<FadeVariant, gsap.TweenVars> = {
  up: { y: 50 },
  down: { y: -50 },
  left: { x: -50 },
  right: { x: 50 },
  zoom: { scale: 0.8 },
};

type BaseProps = { as?: ElementType; children: ReactNode; className?: string; id?: string };

/** One-shot fade + slide as the element enters the viewport (`top 96%`). */
export function Fade({
  as: Tag = "div",
  children,
  className,
  id,
  variant = "up",
  delay = 0,
}: BaseProps & { variant?: FadeVariant; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  const { contextSafe } = useGSAP({ scope: ref });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return void gsap.set(el, { opacity: 1 });
    gsap.set(el, { opacity: 0, ...FADE_FROM[variant] });
    const play = contextSafe(() =>
      gsap.to(el, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 96%", toggleActions: "play none none none" },
      }),
    );
    return onLoaded(play);
  }, [variant, delay, contextSafe]);

  return (
    <Tag ref={ref} id={id} data-motion className={className}>
      {children}
    </Tag>
  );
}

/** Heading/paragraph whose lines resolve from a soft blur, one after another. */
export function BlurText({ as: Tag = "h2", children, className, id }: BaseProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) return void gsap.set(el, { opacity: 1 });
      const run = contextSafe!(() => {
        gsap.set(el, { opacity: 1 });
        SplitText.create(el, {
          type: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.lines,
              { opacity: 0, filter: "blur(10px)", y: 20 },
              {
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 86%",
                  toggleActions: "play none none none",
                },
              },
            ),
        });
      });
      return onLoaded(run);
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-motion className={className}>
      {children}
    </Tag>
  );
}

type ScrubVariant = "bottom" | "top" | "left" | "right" | "zoom";
const SCRUB_FROM: Record<ScrubVariant, gsap.TweenVars> = {
  bottom: { y: 100 },
  top: { y: -80 },
  left: { x: -80 },
  right: { x: 80 },
  zoom: { scale: 0.4 },
};

/** Eases into place in step with the scroll (scrub), from just below the fold to the bottom edge. */
export function ScrubIn({
  as: Tag = "div",
  children,
  className,
  id,
  variant = "bottom",
}: BaseProps & { variant?: ScrubVariant }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.from(el, {
        opacity: 0,
        ...SCRUB_FROM[variant],
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "30px bottom",
          end: "bottom bottom",
          scrub: 3,
          once: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}

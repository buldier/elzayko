"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, onLoaded, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

/** Counts from 0 to `to` the first time it scrolls into view. */
export function CountUp({
  to,
  duration = 2,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = String(to);
      return;
    }
    const state = { value: 0 };
    let tween: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      tween = gsap.to(state, {
        value: to,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = String(Math.round(state.value));
        },
      });
    });
    const off = onLoaded(() => io.observe(el));
    return () => {
      off();
      io.disconnect();
      tween?.kill();
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {to}
    </span>
  );
}

/** Types each word, pauses, deletes it, then moves to the next — with a blinking caret. */
export function TypedWords({ words, className }: { words: string[]; className?: string }) {
  const [text, setText] = useState(words[0] ?? "");

  useEffect(() => {
    if (words.length === 0 || prefersReducedMotion()) return;
    let word = 0;
    let char = words[0]!.length;
    let deleting = true;
    let timer = 0;
    const tick = () => {
      const target = words[word]!;
      char += deleting ? -1 : 1;
      setText(target.slice(0, char));
      let wait = deleting ? 50 : 100;
      if (deleting && char === 0) {
        deleting = false;
        word = (word + 1) % words.length;
      } else if (!deleting && char === target.length) {
        deleting = true;
        wait = 1600;
      }
      timer = window.setTimeout(tick, wait);
    };
    timer = window.setTimeout(tick, 2200);
    return () => window.clearTimeout(timer);
  }, [words]);

  return (
    <span className={className}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden="true">{text}</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[0.12em] animate-[caret_1s_steps(1)_infinite] bg-current"
      />
    </span>
  );
}

/** "Sat, Nov 7" over a ticking HH:MM clock, rendered only after mount. */
export function DateClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return (
    <div
      className={cn("text-right text-sm leading-snug text-white/60", className)}
      aria-hidden="true"
    >
      <p className="!mb-0">
        {now
          ? now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
          : " "}
      </p>
      <p className="!mb-0 font-mono text-white/80 tabular-nums">
        {now ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : " "}
      </p>
    </div>
  );
}

/** Bar that grows from 15% to `value`% when scrolled into view. */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = bar.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(
      el,
      { width: "15%" },
      {
        width: `${value}%`,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" },
      },
    );
  });
  return (
    <div
      className="relative h-10 w-full rounded-lg border border-white/5 bg-white/[0.03] p-1 shadow-[inset_0_1px_8px_rgb(0_0_0/0.6)]"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
    >
      <div
        ref={bar}
        className="flex h-full min-w-[68px] items-center justify-end rounded-lg bg-gradient-to-r from-primary/10 to-primary/70 pr-3 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]"
        style={{ width: `${value}%` }}
      >
        <span className="rounded-md bg-graphite-soft px-2.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-white/80">
          {value} %
        </span>
      </div>
    </div>
  );
}

/**
 * Vertical timeline: a primary-coloured line fills as the list scrolls past and
 * each item lights up once its top passes 30% of the viewport.
 */
export function TimelineTrack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const line = el.querySelector<HTMLElement>("[data-progress-line]");
      if (prefersReducedMotion()) {
        if (line) gsap.set(line, { height: "100%" });
        el.querySelectorAll("ol > li").forEach((item) => item.setAttribute("data-active", ""));
        return;
      }
      if (line) {
        gsap.fromTo(
          line,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 40%", end: "bottom 30%", scrub: true },
          },
        );
      }
      gsap.utils.toArray<HTMLElement>("ol > li", el).forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 30%",
          onEnter: () => item.setAttribute("data-active", ""),
          onLeaveBack: () => item.removeAttribute("data-active"),
        });
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className={cn("relative", className)}>
      {children}
    </div>
  );
}

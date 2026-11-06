"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import {
  gsap,
  LOADED_EVENT,
  prefersReducedMotion,
  ScrollTrigger,
  setLenis,
  getLenis,
} from "@/lib/motion";

/** Inertial wheel scrolling kept in sync with ScrollTrigger; re-measures triggers after navigation. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.1, autoRaf: false, anchors: { offset: -24 } });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) getLenis()?.scrollTo(0, { immediate: true, force: true });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", onLoad);
    };
  }, [pathname]);

  return null;
}

/**
 * Full-screen spinner shown on the first paint, faded out once the page has loaded.
 * Server-rendered (hidden by CSS without JavaScript); entrance animations wait for it.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const finish = () => {
      el?.setAttribute("data-done", "");
      window.dispatchEvent(new Event(LOADED_EVENT));
    };
    if (!el) return finish();
    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      gsap.to(el, {
        autoAlpha: 0,
        duration: prefersReducedMotion() ? 0 : 0.6,
        ease: "power1.out",
        onComplete: () => {
          el.style.display = "none";
          finish();
        },
      });
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    // Never hold the page hostage to a slow asset.
    const fallback = window.setTimeout(hide, 2500);
    return () => {
      window.removeEventListener("load", hide);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-preloader
      aria-hidden="true"
      className="fixed inset-0 z-[300] grid place-items-center bg-[#0f0f0f]"
    >
      <span className="size-12 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
    </div>
  );
}

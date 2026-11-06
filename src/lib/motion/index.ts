"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const LOADED_EVENT = "elzayko:loaded";

/** True while the public site's intro preloader is still on screen (never true in the admin). */
export function isPreloading() {
  return (
    typeof document !== "undefined" &&
    document.querySelector("[data-preloader]:not([data-done])") !== null
  );
}

/** Runs `fn` once the preloader is gone (immediately if it already is). Returns an unsubscribe. */
export function onLoaded(fn: () => void) {
  if (!isPreloading()) {
    fn();
    return () => {};
  }
  window.addEventListener(LOADED_EVENT, fn, { once: true });
  return () => window.removeEventListener(LOADED_EVENT, fn);
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let lenisInstance: Lenis | null = null;
export const setLenis = (lenis: Lenis | null) => {
  lenisInstance = lenis;
};
export const getLenis = () => lenisInstance;

/** Freeze page scrolling (and Lenis) while an overlay is open. */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) lenisInstance?.stop();
  else lenisInstance?.start();
}

export function scrollToTarget(target: string | number) {
  if (lenisInstance)
    lenisInstance.scrollTo(target, { offset: typeof target === "string" ? -24 : 0, duration: 1.2 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

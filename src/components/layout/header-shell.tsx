"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Always a solid bar so the menu reads clearly over any banner; it only tightens on scroll.
const shellClass =
  "group/header fixed top-0 right-0 left-0 z-40 border-b border-white/10 bg-navy-black text-white transition-all duration-300 ease-in-out";
// Compact height (the theme's scrolled padding) at all times.
const topPadding = "py-[10px] md:py-[15px] lg:py-[5px] xl:py-[10px]";
const stickyPadding = `${topPadding} shadow-[0_10px_30px_-15px_rgb(0_0_0/0.8)]`;

/** Fixed navy-black header, identical on every page; it tightens once the visitor scrolls. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header data-overlay={!scrolled} className={cn(shellClass, scrolled ? stickyPadding : topPadding)}>
      {children}
    </header>
  );
}

/** Server fallback: the top-of-page state. */
export function HeaderShellFallback({ children }: { children: ReactNode }) {
  return (
    <header data-overlay className={cn(shellClass, topPadding)}>
      {children}
    </header>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Routes whose first section is a full-bleed image the header floats over. */
const OVERLAY_ROUTES = new Set(["/"]);

/**
 * Sticky header that is transparent (light text) over the homepage hero and becomes
 * a solid paper bar once the visitor scrolls. Children style themselves with
 * `group-data-[overlay=true]/header:` variants.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const overlay = OVERLAY_ROUTES.has(pathname) && !scrolled;
  return (
    <header
      data-overlay={overlay}
      className={cn(
        "group/header sticky top-0 z-40 transition-[background-color,border-color,color] duration-(--duration-base) ease-editorial",
        overlay
          ? "border-b border-transparent bg-transparent text-paper"
          : "border-b border-line/70 bg-paper/90 text-ink backdrop-blur-md supports-[backdrop-filter]:bg-paper/75",
      )}
    >
      {children}
    </header>
  );
}

/** Server fallback: always the solid variant. */
export function HeaderShellFallback({ children }: { children: ReactNode }) {
  return (
    <header data-overlay={false} className="group/header sticky top-0 z-40 border-b border-line/70 bg-paper/90 text-ink backdrop-blur-md">
      {children}
    </header>
  );
}

"use client";

import {
  RiArrowUpLine,
  RiBriefcase4Line,
  RiCloseLine,
  RiGalleryLine,
  RiHome5Line,
  RiMenuLine,
  RiRouteLine,
  RiSendPlaneLine,
  RiStackLine,
  RiUserSmileLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dockNavigation, type DockIcon } from "@/config/navigation";
import { lockScroll, scrollToTarget } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<DockIcon, RemixiconComponentType> = {
  home: RiHome5Line,
  about: RiUserSmileLine,
  journey: RiRouteLine,
  work: RiBriefcase4Line,
  collections: RiStackLine,
  gallery: RiGalleryLine,
  contact: RiSendPlaneLine,
};

/** Which dock item is current: route match, or (on the home page) the section in view. */
function useActiveHref() {
  const pathname = usePathname();
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    const ids = dockNavigation
      .filter((item) => item.href.startsWith("/#"))
      .map((item) => item.href.slice(2));
    const onScroll = () => {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = id;
      }
      setSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname === "/") return section ? `/#${section}` : "/";
  return (
    dockNavigation.find(
      (item) => !item.href.includes("#") && item.href !== "/" && pathname.startsWith(item.href),
    )?.href ?? null
  );
}

/** Same-page section links scroll smoothly instead of jumping. */
function onSectionClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string,
) {
  if (pathname === "/" && href.startsWith("/#")) {
    event.preventDefault();
    scrollToTarget(href.slice(1));
    history.replaceState(null, "", href);
  } else if (pathname === "/" && href === "/") {
    event.preventDefault();
    scrollToTarget(0);
  }
}

/** Fixed vertical icon dock on the right edge (desktop), with tooltips and a back-to-top button. */
export function SideDock() {
  const active = useActiveHref();
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-1/2 right-4 z-50 hidden -translate-y-1/2 flex-col items-center gap-3 min-[1600px]:right-12 lg:flex">
      <nav aria-label="Primary">
        <ul className="flex flex-col items-center gap-1 rounded-full border border-white/5 bg-[#161616]/90 p-1.5 shadow-[0_10px_40px_-10px_rgb(0_0_0/0.8)] backdrop-blur-md">
          {dockNavigation.map((item, i) => {
            const Icon = ICONS[item.icon];
            const isActive = active === item.href;
            return (
              <li key={item.href} className="contents">
                {i === 1 && <span aria-hidden="true" className="my-1 h-3 w-px bg-white/10" />}
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={
                    isActive ? (item.href.includes("#") ? "location" : "page") : undefined
                  }
                  onClick={(event) => onSectionClick(event, item.href, pathname)}
                  className={cn(
                    "group/dock relative grid size-9 place-items-center rounded-full transition-colors duration-300",
                    isActive
                      ? "bg-white/10 text-primary"
                      : "text-white/55 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  <span className="pointer-events-none absolute top-1/2 right-[calc(100%+12px)] translate-x-2 -translate-y-1/2 rounded-md bg-white px-2 py-1 text-xs font-medium whitespace-nowrap text-black opacity-0 transition-all duration-300 group-hover/dock:translate-x-0 group-hover/dock:opacity-100 group-focus-visible/dock:translate-x-0 group-focus-visible/dock:opacity-100">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        onClick={() => scrollToTarget(0)}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        className={cn(
          "grid size-12 place-items-center rounded-full border border-white/5 bg-[#161616]/90 text-white/70 backdrop-blur-md transition-all duration-300 hover:text-primary",
          showTop ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <RiArrowUpLine className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Phones and tablets: slim top bar with the site name and a menu sheet listing the dock items. */
export function MobileBar({ siteName }: { siteName: string }) {
  const [open, setOpen] = useState(false);
  const active = useActiveHref();
  const pathname = usePathname();

  useEffect(() => {
    lockScroll(open);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (open) lockScroll(false);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <div className="fixed inset-x-3 top-3 z-50 flex items-center justify-between rounded-full border border-white/5 bg-[#161616]/90 py-1.5 pr-1.5 pl-5 backdrop-blur-md">
        <Link href="/" className="text-lg font-medium tracking-[-0.02em] text-white">
          {siteName}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full bg-white/5 text-white"
        >
          {open ? <RiCloseLine className="size-5" /> : <RiMenuLine className="size-5" />}
        </button>
      </div>
      <div
        id="mobile-menu"
        hidden={!open}
        data-lenis-prevent
        className="fixed inset-x-3 top-[72px] z-50 max-h-[calc(100dvh-90px)] overflow-y-auto rounded-[24px] border border-white/5 bg-[#161616] p-3 shadow-2xl"
      >
        <nav aria-label="Primary">
          <ul className="grid gap-1">
            {dockNavigation.map((item) => {
              const Icon = ICONS[item.icon];
              const isActive = active === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={
                      isActive ? (item.href.includes("#") ? "location" : "page") : undefined
                    }
                    onClick={(event) => {
                      setOpen(false);
                      onSectionClick(event, item.href, pathname);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-lg transition-colors",
                      isActive ? "bg-white/10 text-primary" : "text-white/75 hover:bg-white/5",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

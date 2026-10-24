"use client";

import { RiArrowDownSLine } from "@remixicon/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { headerNavigation, type PublicNavItem } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

export type NavCollection = { title: string; slug: string };

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Exact match on path and query, so `/gallery?type=image` is distinct from `/gallery`. */
export function isActiveHref(pathname: string, search: string, href: string) {
  return href === (search ? `${pathname}?${search}` : pathname);
}

/** A top-level item is active when its page, one of its children, or its detail-page prefix matches. */
export function isActiveItem(item: PublicNavItem, pathname: string, search: string) {
  if (item.activePrefix && pathname.startsWith(item.activePrefix)) return true;
  if (item.children) return item.children.some((child) => isActiveHref(pathname, search, child.href));
  return isActivePath(pathname, item.href);
}

const linkClass = "relative block py-5 text-white transition-all duration-300 ease-in-out hover:text-primary";
const activeClass = "text-primary";

export function NavLinks({ className, collections }: { className?: string; collections: NavCollection[] }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  return <NavList className={className} collections={collections} pathname={pathname} search={search} />;
}

/** Server-safe fallback with identical markup and no active state. */
export function NavLinksFallback({ className, collections }: { className?: string; collections: NavCollection[] }) {
  return <NavList className={className} collections={collections} pathname={null} search="" />;
}

/** Desktop navigation: items with children open a dropdown on hover or keyboard focus. */
function NavList({ className, collections, pathname, search }: { className?: string; collections: NavCollection[]; pathname: string | null; search: string }) {
  return (
    <ul className={className}>
      {headerNavigation(collections).map((item) => {
        const active = pathname !== null && isActiveItem(item, pathname, search);
        return (
          <li key={item.label} className="group/item relative">
            <Link
              href={item.href}
              aria-current={active && !item.children ? "page" : undefined}
              className={cn(linkClass, item.children && "pr-[16px]", active && activeClass)}
            >
              {item.label}
              {item.children && <RiArrowDownSLine className="absolute top-1/2 -right-[3px] size-4 -translate-y-1/2" aria-hidden="true" />}
            </Link>
            {item.children && (
              <ul className="invisible absolute top-full left-0 z-10 min-w-[270px] bg-navy-black py-[25px] opacity-0 transition-all duration-300 ease-in-out group-focus-within/item:visible group-focus-within/item:opacity-100 group-hover/item:visible group-hover/item:opacity-100 xl:min-w-[300px]">
                {item.children.map((child) => {
                  const childActive = pathname !== null && isActiveHref(pathname, search, child.href);
                  return (
                    <li key={child.href} className="relative mb-[17px] last:mb-0">
                      <Link
                        href={child.href}
                        aria-current={childActive ? "page" : undefined}
                        className={cn("relative block px-[25px] text-white transition-all duration-300 ease-in-out hover:text-primary", childActive && "text-primary")}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

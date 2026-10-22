"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {publicNavigation.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "link-underline py-1 transition-colors duration-(--duration-fast)",
                active
                  ? "text-current [background-size:100%_1px]"
                  : "text-muted hover:text-ink group-data-[overlay=true]/header:text-paper/75 group-data-[overlay=true]/header:hover:text-paper",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Server-safe fallback with identical markup and no active state. */
export function NavLinksFallback({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {publicNavigation.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="link-underline py-1 text-muted hover:text-ink group-data-[overlay=true]/header:text-paper/75">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

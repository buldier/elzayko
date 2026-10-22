"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { legalNavigation, publicNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import { isActivePath } from "./nav-links";

/** Full-screen menu using a modal <dialog>: native focus trap, Esc to close, inert background. */
export function MobileNavigation({ siteName }: { siteName: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close when the route changes (e.g. after following a link).
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="-mr-2 inline-flex size-11 items-center justify-center text-current md:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-transparent open:animate-fade-in md:hidden"
      >
        <div className="page-container flex h-full flex-col">
          <div className="flex h-(--header-height) items-center justify-between">
            <span className="font-display text-[1.65rem] italic">{siteName}</span>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="-mr-2 inline-flex size-11 items-center justify-center"
              aria-label="Close menu"
              autoFocus
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="Primary" className="flex flex-1 flex-col justify-center">
            <ul className="space-y-2">
              {publicNavigation.map((item, index) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href} className="animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
                    <Link
                      href={item.href}
                      onClick={() => dialogRef.current?.close()}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block py-2 font-display text-5xl leading-tight",
                        active ? "text-rosewood italic" : "text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <ul className="flex gap-6 border-t border-line py-6 text-sm text-muted">
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => dialogRef.current?.close()}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}

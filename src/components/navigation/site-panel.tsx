"use client";

import { RiArrowDownSLine, RiCloseLine, RiMailLine, RiMapPinLine, RiSendPlaneLine } from "@remixicon/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { headerNavigation } from "@/config/navigation";
import type { SocialLink } from "@/features/settings/schemas";
import { cn } from "@/lib/utils/cn";
import { isActiveHref, isActiveItem, type NavCollection } from "./nav-links";
import { SiteLogo } from "@/components/site/site-logo";
import { SocialIcons } from "./social-icons";

type Props = {
  collections: NavCollection[];
  siteName: string;
  description: string;
  contactEmail: string | null;
  location: string | null;
  socialLinks: SocialLink[];
};

/**
 * Off-canvas panel that slides in from the right, using a modal <dialog> for the native
 * focus trap, Esc to close and inert background. Opened from the burger on phones and tablets
 * (below `lg`); on desktop the menu and email sit directly in the header.
 */
export function SitePanel({ collections, siteName, description, contactEmail, location, socialLinks }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const close = () => dialogRef.current?.close();

  // Close when the route changes (e.g. after following a link).
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname, search]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex size-[50px] shrink-0 items-center justify-center text-white lg:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
      >
        <span className="flex flex-col gap-[5px]" aria-hidden="true">
          <span className="block h-[3px] w-[30px] bg-white" />
          <span className="block h-[3px] w-[30px] bg-white" />
          <span className="block h-[3px] w-[30px] bg-white" />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        data-scroll-lock
        onClick={(event) => event.target === event.currentTarget && close()}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-[500px] overflow-y-auto bg-navy-black p-0 font-body text-white backdrop:bg-black/70 open:animate-slide-in-right motion-reduce:open:animate-none"
      >
        <div className="flex items-center justify-between border-b border-white/15 p-[20px] py-[30px] md:p-[30px] lg:px-[40px]">
          <SiteLogo name={siteName} onClick={close} />
          <button
            type="button"
            onClick={close}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/30 transition-colors duration-(--duration-base) hover:border-primary hover:bg-primary"
            aria-label="Close menu"
            autoFocus
          >
            <RiCloseLine className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Primary" className="border-b border-white/15 p-[20px] md:p-[30px]">
          <ul className="space-y-4">
            {headerNavigation(collections).map((item) => {
              const active = isActiveItem(item, pathname, search);
              const link = (
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={active && !item.children ? "page" : undefined}
                  className={cn("block hover:text-primary", active && "text-primary")}
                >
                  {item.label}
                </Link>
              );
              if (!item.children) return <li key={item.label}>{link}</li>;
              return (
                <PanelGroup key={item.label} label={item.label} link={link} defaultOpen={active}>
                  {item.children.map((child) => {
                    const childActive = isActiveHref(pathname, search, child.href);
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={close}
                          aria-current={childActive ? "page" : undefined}
                          className={cn("block hover:text-primary", childActive && "text-primary")}
                        >
                          {child.label}
                        </Link>
                      </li>
                    );
                  })}
                </PanelGroup>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-10 p-[20px] md:p-[30px] lg:p-[40px]">
          {description && <p className="leading-relaxed text-white/90">{description}</p>}

          <section>
            <h2 className="mb-5 font-body text-xl font-semibold">Get In Touch</h2>
            <ul className="space-y-5">
              {contactEmail && (
                <ContactRow icon={<RiMailLine className="size-5" aria-hidden="true" />} label="Email Us">
                  <a href={`mailto:${contactEmail}`} className="break-all hover:text-primary">
                    {contactEmail}
                  </a>
                </ContactRow>
              )}
              {location && (
                <ContactRow icon={<RiMapPinLine className="size-5" aria-hidden="true" />} label="Based In">
                  {location}
                </ContactRow>
              )}
              <ContactRow icon={<RiSendPlaneLine className="size-5" aria-hidden="true" />} label="Write To Us">
                <Link href="/contact" onClick={close} className="hover:text-primary">
                  Send a message
                </Link>
              </ContactRow>
            </ul>
          </section>

          {socialLinks.length > 0 && (
            <section>
              <h2 className="mb-5 font-body text-xl font-semibold">Follow Us</h2>
              <SocialIcons links={socialLinks} className="gap-5" />
            </section>
          )}
        </div>
      </dialog>
    </>
  );
}

/** Nav item with an expandable list of sub-links; the parent stays a normal link. */
function PanelGroup({ label, link, defaultOpen, children }: { label: string; link: ReactNode; defaultOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const listId = useId();
  return (
    <li>
      <div className="flex items-center justify-between gap-4">
        {link}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${open ? "Hide" : "Show"} ${label} links`}
          className="-mr-2 inline-flex size-9 items-center justify-center hover:text-primary"
        >
          <RiArrowDownSLine className={cn("size-5 transition-transform duration-(--duration-base)", open && "rotate-180")} aria-hidden="true" />
        </button>
      </div>
      <ul id={listId} hidden={!open} className="mt-3 space-y-3 border-l border-white/15 pl-4 text-white/80">
        {children}
      </ul>
    </li>
  );
}

function ContactRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-4">
      <span className="inline-flex size-[50px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-black text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="font-medium text-white/60">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </li>
  );
}

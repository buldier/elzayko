import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { Fade } from "@/components/isak/motion/reveal";
import { legalNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

/** Fixed full-page backdrop: a muted, looping film when one is uploaded, otherwise drifting smoke. */
export function Backdrop({ videoSrc, poster }: { videoSrc: string | null; poster: string | null }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void"
    >
      {videoSrc ? (
        <video
          className="size-full object-cover opacity-30 motion-reduce:hidden"
          src={videoSrc}
          poster={poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <>
          <div className="isak-smoke absolute -top-1/4 -left-1/4 size-[80vmax] rounded-full bg-[radial-gradient(circle,rgb(37_99_255/0.16),transparent_60%)] blur-3xl" />
          <div className="isak-smoke isak-smoke-2 absolute -right-1/4 -bottom-1/3 size-[90vmax] rounded-full bg-[radial-gradient(circle,rgb(255_59_59/0.09),transparent_60%)] blur-3xl" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/60 to-void/90" />
    </div>
  );
}

/** Small pill label that opens every section ("About", "Work Highlights"…). */
export function SectionTag({
  icon,
  children,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Fade
      className={cn(
        "mb-6 inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.06] px-2.5 py-1 text-xs font-medium tracking-wide text-white/80 uppercase",
        className,
      )}
    >
      {icon && (
        <span className="text-signal-yellow" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </Fade>
  );
}

type FooterProps = {
  siteName: string;
  quote: string | null;
  contactEmail: string | null;
};

/** Closing block: pull quote, the oversized wordmark and the legal line. */
export function IsakFooter({ siteName, quote, contactEmail }: FooterProps) {
  return (
    <footer className="pt-16 pb-10 md:pt-24">
      {quote && (
        <Fade as="figure" className="border-b border-white/10 pb-16 md:pb-20">
          <blockquote className="font-display text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.2] text-white/80">
            &ldquo; {quote} &rdquo;
          </blockquote>
          <figcaption className="mt-5 text-right font-display text-xl text-white/55">
            {siteName}
          </figcaption>
        </Fade>
      )}

      <div className="relative mt-14 select-none md:mt-20" aria-hidden="true">
        <Fade
          variant="zoom"
          className="isak-wordmark text-[clamp(5rem,17vw,11rem)] leading-[0.82] font-medium tracking-[-0.06em] text-white/80"
        >
          {siteName}
        </Fade>
        <Fade
          delay={0.15}
          className="isak-wordmark text-right text-[clamp(5rem,17vw,11rem)] leading-[0.82] font-light tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.45)]"
        >
          Archive
        </Fade>
      </div>

      <div className="mt-10 flex flex-col gap-4 text-sm text-white/55 sm:flex-row sm:items-end sm:justify-between">
        <p className="!mb-0 leading-relaxed">
          All rights reserved
          <br />© <CopyrightYear /> {siteName}
        </p>
        <ul className="flex flex-wrap items-center gap-4">
          {contactEmail && (
            <li>
              <a href={`mailto:${contactEmail}`} className="transition-colors hover:text-primary">
                {contactEmail}
              </a>
            </li>
          )}
          {legalNavigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="transition-colors hover:text-primary">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

/** Cached so the year is part of the static shell (refreshed at least daily). */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

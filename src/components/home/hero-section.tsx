import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MediaImage } from "@/components/media/media-image";
import { ButtonLink } from "@/components/ui/button";
import type { MediaCardData } from "@/features/media/types";

type Props = {
  heading: string;
  intro: string;
  tagline: string;
  lead: MediaCardData | null;
  stats: { label: string; value: number }[];
};

/**
 * Full-bleed, image-led first viewport with the display headline set over a soft scrim,
 * followed by an editorial statement band.
 */
export function HeroSection({ heading, intro, tagline, lead, stats }: Props) {
  const leadImage = lead?.preview ?? lead?.image;
  return (
    <>
      <section aria-labelledby="hero-heading" className="relative -mt-(--header-height) h-[100svh] min-h-[36rem] overflow-hidden bg-ink text-paper">
        {lead && leadImage && (
          <MediaImage
            image={leadImage}
            alt={lead.altText}
            sizes="100vw"
            mode="fill"
            priority
            className="animate-hero-zoom motion-reduce:animate-none"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(20_18_16/0.45)_0%,rgb(20_18_16/0)_28%,rgb(20_18_16/0)_45%,rgb(20_18_16/0.72)_100%)]" aria-hidden="true" />

        <div className="page-container relative flex h-full flex-col justify-end pb-10 md:pb-14">
          <div className="grid items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="animate-fade-up text-xs font-semibold tracking-[0.22em] text-paper/80 uppercase">{tagline}</p>
              <h1 id="hero-heading" className="mt-5 animate-fade-up text-display text-paper [animation-delay:100ms]">
                {heading}
              </h1>
            </div>
            <div className="flex animate-fade-up flex-col gap-5 [animation-delay:220ms] md:col-span-4 md:items-end md:text-right">
              <ButtonLink href="/gallery" size="lg" className="bg-paper text-ink hover:bg-paper-raised">
                Enter the gallery
              </ButtonLink>
              {lead && (
                <Link href={`/gallery/${lead.slug}`} className="group inline-flex items-center gap-1.5 text-sm text-paper/80 hover:text-paper">
                  <span className="font-display text-base italic">{lead.title}</span>
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
          <a
            href="#introduction"
            className="mt-10 hidden items-center gap-2 self-start text-xs tracking-[0.2em] text-paper/70 uppercase hover:text-paper md:inline-flex"
          >
            <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" /> Scroll
          </a>
        </div>
      </section>

      <section id="introduction" aria-label="Introduction" className="page-container py-20 md:py-32">
        <div className="grid gap-12 md:grid-cols-12">
          <p className="eyebrow md:col-span-3 md:pt-3">Introduction</p>
          <div className="md:col-span-9">
            <p className="max-w-4xl font-display text-[clamp(1.75rem,1.2rem+2vw,3.1rem)] leading-[1.18] text-ink">{intro}</p>
            {stats.length > 0 && (
              <dl className="mt-14 grid max-w-3xl grid-cols-3 gap-6 border-t border-line pt-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-xs tracking-[0.16em] text-muted uppercase">{stat.label}</dt>
                    <dd className="mt-2 font-display text-4xl tabular-nums md:text-5xl">{String(stat.value).padStart(2, "0")}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

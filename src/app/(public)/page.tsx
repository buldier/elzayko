import { ArrowRight, Images } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/states";
import { CollectionCard } from "@/components/gallery/collection-card";
import { EditorialGrid } from "@/components/home/editorial-grid";
import { HeroSection } from "@/components/home/hero-section";
import { SectionHeading } from "@/components/layout/section-heading";
import { MediaCard } from "@/components/media/media-card";
import { MediaImage } from "@/components/media/media-image";
import { ButtonLink } from "@/components/ui/button";
import { getPublicCollections } from "@/features/collections/service";
import { getFeaturedMedia, getLatestMedia, getPublicStats } from "@/features/media/queries";
import { getPortrait } from "@/features/pages/portrait";
import { getPage } from "@/features/pages/service";
import { getSiteSettings } from "@/features/settings/service";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: { absolute: `${settings.siteName} — ${settings.tagline}` },
    description: settings.description,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [settings, featured, latest, collections, about, stats] = await Promise.all([
    getSiteSettings(),
    getFeaturedMedia(8),
    getLatestMedia(12),
    getPublicCollections(),
    getPage("about"),
    getPublicStats(),
  ]);
  const portrait = await getPortrait(about.content.portraitMediaId);

  const lead = featured.find((item) => item.preview) ?? null;
  const selected = featured.filter((item) => item !== lead && item.image).slice(0, 6);
  const shownIds = new Set([lead?.id, ...selected.map((item) => item.id)]);
  const recent = latest.filter((item) => !shownIds.has(item.id)).slice(0, 4);

  if (featured.length === 0) {
    return (
      <div className="page-container pt-(--header-height)">
        <EmptyState
          icon={Images}
          title="The gallery is being prepared"
          description="New photographs and films will appear here soon."
          action={
            <ButtonLink href="/about" variant="secondary">
              About the author
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <>
      <HeroSection
        heading={settings.heroHeading}
        intro={settings.heroIntro}
        tagline={settings.tagline}
        lead={lead}
        stats={[
          { label: "Photographs", value: stats.photographs },
          { label: "Films", value: stats.films },
          { label: "Collections", value: collections.length },
        ]}
      />

      {selected.length > 0 && (
        <section aria-labelledby="selected-heading" className="page-container pb-24 md:pb-36">
          <SectionHeading
            id="selected-heading"
            index="01"
            eyebrow="Selected work"
            title="Recent favourites, chosen slowly."
            action={<ViewAll href="/gallery" label="View all work" />}
            className="mb-14 md:mb-20"
          />
          <EditorialGrid items={selected} />
        </section>
      )}

      {collections.length > 0 && (
        <section aria-labelledby="collections-heading" className="bg-ink py-24 text-paper md:py-32">
          <div className="page-container">
            <SectionHeading
              id="collections-heading"
              index="02"
              eyebrow="Collections"
              title="Series and long looks."
              description="Bodies of work gathered by place, season or idea."
              tone="inverse"
              className="mb-14"
            />
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {collections.slice(0, 3).map((collection) => (
                <li key={collection.id}>
                  <CollectionCard collection={collection} tone="inverse" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="about-heading" className="page-container py-24 md:py-36">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-paper-sunk">
              {portrait && <MediaImage image={portrait} alt={portrait.alt} sizes="(min-width: 768px) 40vw, 100vw" mode="fill" />}
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="eyebrow mb-6">
              <span className="mr-3 text-ink tabular-nums">03</span>About
            </p>
            <h2 id="about-heading" className="text-headline">
              {about.content.heading}
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">{about.content.intro}</p>
            {about.content.interests.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {about.content.interests.slice(0, 5).map((interest) => (
                  <li key={interest} className="rounded-full border border-line-strong px-3.5 py-1 text-xs tracking-wide text-ink-soft">
                    {interest}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/about">Read the story</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Get in touch
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="latest-heading" className="page-container border-t border-line pt-20 pb-24 md:pt-28 md:pb-32">
          <SectionHeading
            id="latest-heading"
            index="04"
            eyebrow="Latest"
            title="Newly added."
            action={<ViewAll href="/gallery" label="Explore the archive" />}
            className="mb-12"
          />
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((item) => (
              <li key={item.id}>
                <div className="relative aspect-[4/5]">
                  <MediaCard media={item} mode="fill" showMeta={false} sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" className="absolute inset-0" />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl leading-tight">
                    <Link href={`/gallery/${item.slug}`} className="link-underline">
                      {item.title}
                    </Link>
                  </h3>
                  <span className="shrink-0 text-[0.68rem] font-semibold tracking-[0.16em] text-muted uppercase">
                    {item.mediaType === "IMAGE" ? "Photo" : item.mediaType === "VIDEO" ? "Film" : item.providerLabel}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-current">
      <span className="link-underline">{label}</span>
      <ArrowRight className="size-4 transition-transform duration-(--duration-base) group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  );
}

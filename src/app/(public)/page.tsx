import {
  RiArrowRightUpLine,
  RiBriefcase4Line,
  RiChat3Line,
  RiRouteLine,
  RiSendPlaneLine,
  RiStackLine,
  RiUserSmileLine,
  RiFocus3Line,
} from "@remixicon/react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionTag } from "@/components/isak/chrome";
import {
  CollectionAccordion,
  type AccordionCollection,
} from "@/components/isak/collection-accordion";
import { FlipFan, type FanItem } from "@/components/isak/motion/flip-fan";
import { BlurText, Fade, ScrubIn } from "@/components/isak/motion/reveal";
import { Journey } from "@/components/isak/journey";
import { CountUp, ProgressBar } from "@/components/isak/motion/widgets";
import { NotesSlider, type Note } from "@/components/isak/notes-slider";
import { WorkStack, type WorkItem } from "@/components/isak/work-stack";
import { MediaImage } from "@/components/media/media-image";
import { SiteEmptyState } from "@/components/site/site-empty-state";
import { getPublicCategories } from "@/features/categories/service";
import { getPublicCollections } from "@/features/collections/service";
import { galleryHref } from "@/features/media/gallery-url";
import {
  getFeaturedMedia,
  getGalleryPage,
  getLatestMedia,
  getPublicStats,
} from "@/features/media/queries";
import { parseGalleryFilters } from "@/features/media/schemas";
import type { MediaCardData } from "@/features/media/types";
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

const section = "scroll-mt-6 py-16 md:py-24";
const sectionTitle = "!mb-6 text-[clamp(1.9rem,3.6vw,2.6rem)]";

export default async function HomePage() {
  const [settings, featured, latest, collections, categories, about, contact, stats] =
    await Promise.all([
      getSiteSettings(),
      getFeaturedMedia(12),
      getLatestMedia(16),
      getPublicCollections(),
      getPublicCategories(),
      getPage("about"),
      getPage("contact"),
      getPublicStats(),
    ]);

  if (featured.length === 0 && latest.length === 0) {
    return (
      <div className="pt-16 lg:pt-24">
        <SiteEmptyState
          title="The gallery is being prepared"
          description="New photographs and films will appear here soon."
          action={{ href: "/about", label: "About the author" }}
        />
      </div>
    );
  }

  const pictured = unique([...featured, ...latest]).filter((item) => item.preview ?? item.image);
  const fan: FanItem[] = pictured.slice(0, 6).map((item) => ({
    href: `/gallery/${item.slug}`,
    title: item.title,
    image: (item.image ?? item.preview)!,
    alt: item.altText,
  }));
  const work: WorkItem[] = pictured
    .filter((item) => item.preview)
    .slice(0, 4)
    .map((item) => ({
      href: `/gallery/${item.slug}`,
      title: item.title,
      caption: item.caption,
      image: item.preview!,
      alt: item.altText,
      year: item.publishedAt ? String(new Date(item.publishedAt).getFullYear()) : null,
      kind: typeLabel(item),
      tags: [item.category?.name, typeLabel(item)].filter((tag): tag is string => Boolean(tag)),
    }));
  const portrait =
    (await getPortrait(about.content.portraitMediaId)) ?? imageOf(pictured[1] ?? pictured[0]);
  const accordion = await collectionsWithImages(collections.slice(0, 4));
  const categoryTotal = categories.reduce((sum, category) => sum + category.count, 0) || 1;
  const notes: Note[] = pictured
    .filter((item) => item.caption)
    .slice(0, 5)
    .map((item) => ({
      quote: item.caption!,
      title: item.title,
      meta: [
        item.category?.name,
        item.publishedAt ? new Date(item.publishedAt).getFullYear() : null,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/gallery/${item.slug}`,
    }));
  const notesImage = imageOf(pictured[2] ?? pictured[0]);
  const years = pictured.flatMap((item) =>
    item.publishedAt ? [new Date(item.publishedAt).getFullYear()] : [],
  );
  const [minYear, maxYear] = [Math.min(...years), Math.max(...years)];
  const yearRange =
    years.length === 0
      ? null
      : minYear === maxYear
        ? `${minYear}©`
        : `${minYear}–${String(maxYear).slice(-2)}©`;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        id="home"
        aria-labelledby="hero-heading"
        className="scroll-mt-6 pt-12 pb-10 md:pb-16 lg:pt-24"
      >
        <BlurText
          as="h1"
          id="hero-heading"
          className="max-w-[620px] text-[clamp(2.4rem,5vw,4rem)] !leading-[1.05] !text-white/80"
        >
          {settings.heroHeading}
        </BlurText>

        <Fade className="mt-8 flex flex-wrap items-center gap-5">
          <Link href="/gallery" className="isak-pill">
            <span className="isak-pill-icon">
              <RiArrowRightUpLine className="size-4" aria-hidden="true" />
            </span>
            Enter the gallery
          </Link>
          {settings.tagline && <span className="text-sm text-white/50">{settings.tagline}</span>}
        </Fade>

        <div className="mt-2 grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <FlipFan items={fan} />
          <div className="grid grid-cols-2 gap-8 md:grid-cols-1 md:pr-2">
            <Counter value={stats.photographs} label="Photographs" />
            <Counter value={stats.films} label="Short films" />
            <Counter value={collections.length} label="Collections" />
          </div>
        </div>

        {about.content.interests.length > 0 && (
          <div className="mt-14">
            <Fade as="p" className="!mb-5 text-sm font-medium text-white/85">
              Subjects &amp; craft{yearRange && ` (${yearRange})`}
            </Fade>
            <Marquee items={about.content.interests} />
          </div>
        )}
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section id="about" aria-labelledby="about-heading" className={section}>
        <SectionTag icon={<RiUserSmileLine className="size-4" />}>About</SectionTag>
        <BlurText id="about-heading" className={sectionTitle}>
          {about.content.heading}
        </BlurText>
        <ScrubIn variant="top" className="max-w-[600px] space-y-5 text-white/55">
          <p>{about.content.intro}</p>
          {about.content.biography && <p>{about.content.biography.split(/\n{2,}/)[0]}</p>}
        </ScrubIn>
        {portrait && (
          <Fade variant="zoom" className="mx-auto mt-14 w-[min(100%,300px)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/10">
              <MediaImage image={portrait} alt={portrait.alt} sizes="300px" mode="fill" />
            </div>
          </Fade>
        )}
        <Fade className="mt-10 text-center">
          <Link href="/about" className="primary-btn with-border">
            Read the full story
          </Link>
        </Fade>
      </section>

      {/* ── Journey (timeline) ───────────────────────────────── */}
      {about.content.highlights.length > 0 && (
        <section id="journey" aria-labelledby="journey-heading" className={section}>
          <SectionTag icon={<RiRouteLine className="size-4" />}>
            Exhibitions &amp; milestones
          </SectionTag>
          <h2 id="journey-heading" className="sr-only">
            Exhibitions and milestones
          </h2>
          <Journey highlights={about.content.highlights} />
        </section>
      )}

      {/* ── Work highlights (sticky stack) ───────────────────── */}
      {work.length > 0 && (
        <section id="work" aria-labelledby="work-heading" className={section}>
          <div className="lg:sticky lg:top-[72px] lg:z-10">
            <SectionTag icon={<RiBriefcase4Line className="size-4" />}>Work highlights</SectionTag>
          </div>
          <h2 id="work-heading" className="sr-only">
            Work highlights
          </h2>
          <WorkStack items={work} />
        </section>
      )}

      {/* ── Collections (accordion) ──────────────────────────── */}
      {accordion.length > 0 && (
        <section id="collections" aria-labelledby="collections-heading" className={section}>
          <SectionTag icon={<RiStackLine className="size-4" />}>Collections</SectionTag>
          <h2 id="collections-heading" className="sr-only">
            Collections
          </h2>
          <CollectionAccordion items={accordion} />
        </section>
      )}

      {/* ── Focus (progress bars) ────────────────────────────── */}
      {categories.length > 0 && (
        <section id="focus" aria-labelledby="focus-heading" className={section}>
          <SectionTag icon={<RiFocus3Line className="size-4" />}>Focus</SectionTag>
          <BlurText id="focus-heading" className={`${sectionTitle} max-w-[560px]`}>
            Where the archive spends its time, subject by subject
          </BlurText>
          <ul className="mt-10">
            {categories.slice(0, 6).map((category) => (
              <Fade
                as="li"
                key={category.slug}
                className="grid items-center gap-5 border-b border-white/[0.06] py-6 last:border-b-0 sm:grid-cols-2"
              >
                <Link
                  href={galleryHref({ category: category.slug })}
                  className="group flex items-center gap-4"
                >
                  <span className="grid size-12 flex-none place-items-center rounded-full bg-[#1c1c1c] font-display text-xl text-white/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-colors group-hover:text-primary">
                    {category.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-medium text-white/85 group-hover:text-primary">
                      {category.name}
                    </span>
                    <span className="block text-sm text-white/45">
                      {category.count} {category.count === 1 ? "work" : "works"}
                    </span>
                  </span>
                </Link>
                <ProgressBar
                  value={Math.max(15, Math.round((category.count / categoryTotal) * 100))}
                  label={`${category.name}: share of the archive`}
                />
              </Fade>
            ))}
          </ul>
        </section>
      )}

      {/* ── Notes (testimonial-style slider) ─────────────────── */}
      {notes.length > 0 && (
        <section id="notes" aria-labelledby="notes-heading" className={section}>
          <SectionTag icon={<RiChat3Line className="size-4" />}>From the archive</SectionTag>
          <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
            <div>
              <BlurText id="notes-heading" className={`${sectionTitle} max-w-[340px]`}>
                Notes from behind the frame
              </BlurText>
              <div className="mt-8 flex gap-12">
                <Counter value={stats.photographs + stats.films} label="Works published" />
                <Counter value={collections.length} label="Series" />
              </div>
            </div>
            {notesImage && (
              <Fade
                variant="right"
                className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] ring-1 ring-white/10 sm:w-[240px]"
              >
                <MediaImage image={notesImage} alt={notesImage.alt} sizes="240px" mode="fill" />
              </Fade>
            )}
          </div>
          <Fade className="mt-12">
            <NotesSlider notes={notes} />
          </Fade>
        </section>
      )}

      {/* ── Contact ──────────────────────────────────────────── */}
      <section id="contact" aria-labelledby="contact-heading" className={section}>
        <SectionTag icon={<RiSendPlaneLine className="size-4" />}>Contact</SectionTag>
        <BlurText id="contact-heading" className={`${sectionTitle} max-w-[600px]`}>
          {contact.content.intro || contact.content.heading}
        </BlurText>
        <Fade className="mt-10">
          <ContactForm />
        </Fade>
      </section>
    </>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <Fade>
      <p className="!mb-1 flex items-start text-[clamp(2.75rem,5vw,3.75rem)] leading-none font-light tracking-[-0.05em] text-white/80">
        <CountUp to={value} />
        <span className="text-[0.7em]">+</span>
      </p>
      <p className="!mb-0 text-sm text-white/55">{label}</p>
    </Fade>
  );
}

/** Two copies of the list scrolling left in a loop, faded at the edges. */
function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {items.map((item) => (
        <li
          key={item}
          className="text-2xl font-medium tracking-[-0.03em] whitespace-nowrap text-white/40"
        >
          {item}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max animate-[isak-marquee_28s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

async function collectionsWithImages(
  collections: Awaited<ReturnType<typeof getPublicCollections>>,
): Promise<AccordionCollection[]> {
  return Promise.all(
    collections.map(async (collection) => {
      const page = await getGalleryPage(
        parseGalleryFilters({ collection: collection.slug, type: "image" }),
      );
      const images = [
        ...(collection.cover ? [collection.cover] : []),
        ...page.items
          .map(imageOf)
          .filter((image): image is NonNullable<typeof image> => image !== null),
      ];
      return {
        title: collection.title,
        href: galleryHref({ collection: collection.slug }),
        description: collection.description,
        count: collection.count,
        featured: collection.featured,
        images: uniqueBySrc(images).slice(0, 3),
      };
    }),
  );
}

function imageOf(item: MediaCardData | undefined) {
  const image = item?.image ?? item?.preview;
  return item && image ? { ...image, alt: item.altText } : null;
}

function typeLabel(item: MediaCardData) {
  return item.mediaType === "IMAGE"
    ? "Photograph"
    : item.mediaType === "VIDEO"
      ? "Film"
      : (item.providerLabel ?? "Link");
}

function unique(items: MediaCardData[]) {
  return items.filter((item, index) => items.findIndex((other) => other.id === item.id) === index);
}

function uniqueBySrc<T extends { src: string }>(items: T[]) {
  return items.filter(
    (item, index) => items.findIndex((other) => other.src === item.src) === index,
  );
}

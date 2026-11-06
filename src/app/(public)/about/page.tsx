import { RiCompass3Line, RiRouteLine, RiUserSmileLine } from "@remixicon/react";
import type { Metadata } from "next";
import { SectionTag } from "@/components/isak/chrome";
import { Journey } from "@/components/isak/journey";
import { BlurText, Fade, ScrubIn } from "@/components/isak/motion/reveal";
import { CountUp } from "@/components/isak/motion/widgets";
import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { PageBanner } from "@/components/site/page-banner";
import { RichText } from "@/components/ui/rich-text";
import { getPublicCollections } from "@/features/collections/service";
import { getFeaturedMedia, getPublicStats } from "@/features/media/queries";
import { getPortrait } from "@/features/pages/portrait";
import { getPage } from "@/features/pages/service";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return {
    title: page.title,
    description: page.content.intro,
    alternates: { canonical: "/about" },
  };
}

const section = "py-16 md:py-24";
const sectionTitle = "!mb-6 text-[clamp(1.9rem,3.6vw,2.6rem)]";

export default async function AboutPage() {
  const [page, stats, collections, featured] = await Promise.all([
    getPage("about"),
    getPublicStats(),
    getPublicCollections(),
    getFeaturedMedia(8),
  ]);
  const { content } = page;
  const portrait = await getPortrait(content.portraitMediaId);
  const pictured = featured.filter((item) => item.preview);
  const approachPhoto = pictured[3] ?? pictured[0];

  return (
    <>
      <PageBanner
        title={content.heading}
        crumbs={[{ label: page.title }]}
        image={null}
        intro={content.intro}
      />

      {/* Story */}
      <section aria-labelledby="story-heading" className={section}>
        <SectionTag icon={<RiUserSmileLine className="size-4" />}>The story</SectionTag>
        <div className="grid items-start gap-10 sm:grid-cols-[1fr_240px]">
          <div>
            <h2 id="story-heading" className="sr-only">
              The story
            </h2>
            <ScrubIn variant="top" className="text-white/60 [&_p]:text-white/60">
              <RichText source={content.biography} variant="musfix" />
            </ScrubIn>
          </div>
          {portrait && (
            <Fade
              variant="zoom"
              className="relative aspect-[4/5] overflow-hidden rounded-[18px] ring-1 ring-white/10"
            >
              <MediaImage image={portrait} alt={portrait.alt} sizes="240px" mode="fill" priority />
            </Fade>
          )}
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-10">
          <Stat value={stats.photographs} label="Photographs" />
          <Stat value={stats.films} label="Short films" />
          <Stat value={collections.length} label="Collections" />
        </div>
      </section>

      {/* Journey */}
      {content.highlights.length > 0 && (
        <section aria-labelledby="journey-heading" className={section}>
          <SectionTag icon={<RiRouteLine className="size-4" />}>
            Exhibitions &amp; milestones
          </SectionTag>
          <BlurText id="journey-heading" className={sectionTitle}>
            Selected highlights
          </BlurText>
          <Journey highlights={content.highlights} />
        </section>
      )}

      {/* Approach */}
      {(content.philosophy || content.interests.length > 0) && (
        <section aria-labelledby="approach-heading" className={section}>
          <SectionTag icon={<RiCompass3Line className="size-4" />}>Approach</SectionTag>
          {content.philosophy && (
            <BlurText id="approach-heading" className={`${sectionTitle} max-w-[640px]`}>
              {content.philosophy}
            </BlurText>
          )}
          {content.interests.length > 0 && (
            <Fade as="ul" className="mt-8 flex flex-wrap gap-2">
              {content.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full bg-white/[0.06] px-4 py-1.5 text-sm font-medium text-white/75"
                >
                  {interest}
                </li>
              ))}
            </Fade>
          )}
          {approachPhoto?.preview && (
            <Fade variant="zoom" className="mt-12">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] ring-1 ring-white/10">
                <MediaImage
                  image={approachPhoto.preview}
                  alt={approachPhoto.altText}
                  sizes="(min-width: 1024px) 720px, 100vw"
                  mode="fill"
                />
              </div>
            </Fade>
          )}
        </section>
      )}

      <CtaBand
        title={content.ctaHeading || "Let’s make something together"}
        text={
          content.ctaText || "Commissions, collaborations and print enquiries are always welcome."
        }
        action={{ href: "/contact", label: "Get in touch" }}
      />
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Fade>
      <p className="!mb-1 flex items-start text-[clamp(2.5rem,5vw,3.5rem)] leading-none font-light tracking-[-0.05em] text-white/80">
        <CountUp to={value} />
        <span className="text-[0.7em]">+</span>
      </p>
      <p className="!mb-0 text-sm text-white/55">{label}</p>
    </Fade>
  );
}

import type { Metadata } from "next";
import { MediaImage } from "@/components/media/media-image";
import { ButtonLink } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { getPortrait } from "@/features/pages/portrait";
import { getPage } from "@/features/pages/service";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return { title: page.title, description: page.content.intro, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const { content } = await getPage("about");
  const portrait = await getPortrait(content.portraitMediaId);

  return (
    <div className="pb-24">
      <section className="page-container grid gap-12 pt-10 md:grid-cols-12 md:pt-16">
        <div className="md:col-span-6 md:pt-10 lg:col-span-6">
          <p className="eyebrow mb-5">About</p>
          <h1 className="text-display">{content.heading}</h1>
          <p className="mt-8 max-w-xl font-display text-2xl leading-snug text-ink-soft italic">{content.intro}</p>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <div className="relative aspect-[4/5] overflow-hidden bg-paper-sunk">
            {portrait && <MediaImage image={portrait} alt={portrait.alt} sizes="(min-width: 768px) 40vw, 100vw" mode="fill" priority />}
          </div>
        </div>
      </section>

      <section aria-labelledby="bio-heading" className="page-container mt-24 grid gap-10 border-t border-line pt-16 md:grid-cols-12">
        <h2 id="bio-heading" className="eyebrow md:col-span-3">
          Biography
        </h2>
        <RichText source={content.biography} className="md:col-span-7" />
      </section>

      {content.philosophy && (
        <section aria-labelledby="philosophy-heading" className="mt-24 bg-paper-sunk/50 py-20 md:py-28">
          <div className="page-container grid gap-10 md:grid-cols-12">
            <h2 id="philosophy-heading" className="eyebrow md:col-span-3">
              Approach
            </h2>
            <blockquote className="font-display text-3xl leading-snug text-ink md:col-span-8 md:text-[2.6rem]">
              {content.philosophy}
            </blockquote>
          </div>
        </section>
      )}

      <section className="page-container mt-24 grid gap-16 md:grid-cols-12">
        {content.interests.length > 0 && (
          <div className="md:col-span-4">
            <h2 className="eyebrow mb-6">Areas of interest</h2>
            <ul className="space-y-3">
              {content.interests.map((interest) => (
                <li key={interest} className="border-b border-line pb-3 font-display text-2xl">
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        )}
        {content.highlights.length > 0 && (
          <div className="md:col-span-7 md:col-start-6">
            <h2 className="eyebrow mb-6">Selected highlights</h2>
            <ol className="divide-y divide-line border-y border-line">
              {content.highlights.map((highlight) => (
                <li key={`${highlight.year}-${highlight.title}`} className="grid grid-cols-[4.5rem_1fr] gap-4 py-5">
                  <span className="pt-1 text-sm text-muted tabular-nums">{highlight.year}</span>
                  <div>
                    <p className="font-display text-2xl">{highlight.title}</p>
                    {highlight.detail && <p className="mt-1 text-sm text-ink-soft">{highlight.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {(content.ctaHeading || content.ctaText) && (
        <section className="page-container mt-28 text-center">
          <h2 className="text-headline mx-auto max-w-3xl">{content.ctaHeading}</h2>
          {content.ctaText && <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">{content.ctaText}</p>}
          <ButtonLink href="/contact" size="lg" className="mt-10">
            Get in touch
          </ButtonLink>
        </section>
      )}
    </div>
  );
}

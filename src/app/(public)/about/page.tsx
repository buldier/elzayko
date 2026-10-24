import { RiCameraLensLine, RiFocus3Line, RiPaletteLine } from "@remixicon/react";
import type { Metadata } from "next";
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
  return { title: page.title, description: page.content.intro, alternates: { canonical: "/about" } };
}

const sectionTitle = "!font-semibold text-3xl md:text-5xl lg:text-6xl xl:text-[64px] leading-[1.1]";
const VALUE_ICONS = [RiCameraLensLine, RiFocus3Line, RiPaletteLine];

export default async function AboutPage() {
  const [page, stats, collections, featured] = await Promise.all([getPage("about"), getPublicStats(), getPublicCollections(), getFeaturedMedia(8)]);
  const { content } = page;
  const portrait = await getPortrait(content.portraitMediaId);
  const pictured = featured.filter((item) => item.preview);
  const valuesPhoto = pictured[3] ?? pictured[0];

  return (
    <>
      <PageBanner title={page.title} crumbs={[{ label: page.title }]} featuredIndex={3} />

      {/* About */}
      <section aria-labelledby="about-heading" className="relative z-[1] py-[60px] md:py-[80px] lg:py-[100px] xl:py-[120px]">
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-[25px] lg:grid-cols-2">
            <div className="xl:mr-[105px]">
              {portrait && (
                <div className="relative aspect-[805/825] overflow-hidden">
                  <MediaImage image={portrait} alt={portrait.alt} sizes="(min-width: 1024px) 40vw, 100vw" mode="fill" priority />
                </div>
              )}
            </div>
            <div>
              <h2 id="about-heading" className="mb-[20px] text-2xl !font-semibold md:text-4xl">
                {content.heading}
              </h2>
              <p className="text-base font-semibold md:text-lg xl:text-xl">{content.intro}</p>
              <div className="my-[25px] grid grid-cols-1 items-center gap-[25px] md:my-[35px] md:grid-cols-2">
                <div className="border-white/20 md:border-r xl:mr-[35px]">
                  <Counter value={stats.photographs} label="Photographs" />
                  <Counter value={stats.films} label="Films" />
                  <Counter value={collections.length} label="Collections" />
                </div>
                {content.interests.length > 0 && (
                  <p>Drawn to {joinList(content.interests.slice(0, 4).map((interest) => interest.toLowerCase()))}.</p>
                )}
              </div>
              <RichText source={content.biography} variant="musfix" />
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      {content.highlights.length > 0 && (
        <section aria-labelledby="journey-heading" className="pb-[60px] md:pb-[80px] lg:pb-[100px] xl:pb-[120px]">
          <div className="container">
            <h2 id="journey-heading" className={`mb-[25px] md:mb-[35px] lg:mb-[45px] xl:mb-[55px] ${sectionTitle}`}>
              Selected highlights
            </h2>
            <ol className="grid grid-cols-1 gap-[25px] sm:grid-cols-2 lg:grid-cols-3">
              {content.highlights.map((highlight) => (
                <li key={`${highlight.year}-${highlight.title}`} className="bg-navy-black p-[20px] md:p-[30px] lg:p-[40px]">
                  <span className="mb-[10px] block font-semibold text-primary">{highlight.year}</span>
                  <h3 className="mb-[10px] text-base !font-semibold md:mb-[12px] md:text-lg lg:text-xl">{highlight.title}</h3>
                  {highlight.detail && <p className="block text-[#a0a0a0]">{highlight.detail}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Values */}
      {(content.philosophy || content.interests.length > 0) && (
        <section aria-labelledby="values-heading" className="bg-navy-black py-[60px] text-white md:py-[80px] lg:py-[100px] xl:py-[120px]">
          <div className="container">
            <div className="mb-[25px] grid grid-cols-1 items-center gap-[15px] md:mb-[35px] md:gap-[20px] lg:mb-[45px] lg:grid-cols-2 lg:gap-[25px] xl:mb-[55px]">
              <h2 id="values-heading" className={`mb-0 !text-white ${sectionTitle}`}>
                Approach
              </h2>
              {content.philosophy && <p className="md:max-w-[425px] md:text-base lg:ml-auto lg:text-lg">{content.philosophy}</p>}
            </div>
            <div className="grid grid-cols-1 items-center gap-[25px] lg:grid-cols-2">
              <ul>
                {content.interests.slice(0, 3).map((interest, index) => {
                  const Icon = VALUE_ICONS[index % VALUE_ICONS.length]!;
                  return (
                    <li key={interest} className="mb-[20px] last:mb-0 md:mb-[25px] lg:mb-[30px]">
                      <div className="mb-[13px] leading-none text-primary md:mb-[18px]">
                        <Icon className="size-10 md:size-12" aria-hidden="true" />
                      </div>
                      <h3 className="mb-[10px] text-base !font-semibold !text-white md:mb-[15px] md:text-lg lg:text-xl">{interest}</h3>
                    </li>
                  );
                })}
                {content.interests.length > 3 && (
                  <li className="text-[#a0a0a0] md:max-w-[400px]">Also: {joinList(content.interests.slice(3))}.</li>
                )}
              </ul>
              <div>
                {valuesPhoto?.preview && (
                  <div className="relative aspect-[635/580] overflow-hidden xl:ml-auto xl:max-w-[425px]">
                    <MediaImage image={valuesPhoto.preview} alt={valuesPhoto.altText} sizes="(min-width: 1280px) 425px, (min-width: 1024px) 45vw, 100vw" mode="fill" />
                  </div>
                )}
                <div className="mt-[25px] grid grid-cols-2 gap-[25px] md:mt-[35px] lg:mt-[45px] xl:mt-[55px]">
                  <BigCounter value={stats.photographs + stats.films} label="Works published" />
                  <BigCounter value={collections.length} label="Collections" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <CtaBand
        title={content.ctaHeading || "Let’s make something together"}
        text={content.ctaText || "Commissions, collaborations and print enquiries are always welcome."}
        action={{ href: "/contact", label: "Get in touch" }}
      />
    </>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <div className="mb-[15px] flex items-end gap-[10px] leading-none last:mb-0">
      <span className="text-4xl font-semibold text-primary tabular-nums md:text-5xl">{value}</span>
      <span className="text-base font-medium md:text-lg xl:text-xl">{label}</span>
    </div>
  );
}

function BigCounter({ value, label }: { value: number; label: string }) {
  return (
    <div className="relative border-r border-primary pr-[15px] text-right md:pr-[20px] lg:pr-[30px]">
      <span className="mb-[5px] flex items-center justify-end text-4xl leading-none font-semibold tabular-nums md:text-5xl lg:text-6xl xl:text-8xl">{value}</span>
      <span className="block text-base md:text-lg xl:text-xl">{label}</span>
    </div>
  );
}

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

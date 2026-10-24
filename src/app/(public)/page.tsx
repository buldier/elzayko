import { RiFilmLine, RiFolderImageLine, RiImage2Line } from "@remixicon/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FilmsShowcase } from "@/components/home/films-showcase";
import { MediaImage } from "@/components/media/media-image";
import { CtaBand } from "@/components/site/cta-band";
import { GalleryCollage } from "@/components/site/gallery-collage";
import { SiteEmptyState } from "@/components/site/site-empty-state";
import { getPublicCollections, type PublicCollection } from "@/features/collections/service";
import { galleryHref } from "@/features/media/gallery-url";
import { getFeaturedMedia, getLatestMedia, getPublicStats } from "@/features/media/queries";
import type { MediaCardData } from "@/features/media/types";
import { getPortrait } from "@/features/pages/portrait";
import { getPage } from "@/features/pages/service";
import { getSiteSettings } from "@/features/settings/service";
import { formatDate } from "@/lib/utils/format";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: { absolute: `${settings.siteName} — ${settings.tagline}` },
    description: settings.description,
    alternates: { canonical: "/" },
  };
}

const sectionPadding = "py-[60px] md:py-[80px] lg:py-[100px] xl:py-[120px]";
const sectionTitle = "!font-semibold text-3xl md:text-5xl lg:text-6xl xl:text-[64px] leading-[1.1]";

export default async function HomePage() {
  const [settings, featured, latest, collections, about, stats] = await Promise.all([
    getSiteSettings(),
    getFeaturedMedia(12),
    getLatestMedia(16),
    getPublicCollections(),
    getPage("about"),
    getPublicStats(),
  ]);
  const [portrait, heroChoice] = await Promise.all([getPortrait(about.content.portraitMediaId), getPortrait(settings.heroMediaId)]);

  if (featured.length === 0) {
    return (
      <div className="pt-[100px] md:pt-[125px] xl:pt-[130px]">
        <SiteEmptyState
          title="The gallery is being prepared"
          description="New photographs and films will appear here soon."
          action={{ href: "/about", label: "About the author" }}
        />
      </div>
    );
  }

  const pictured = featured.filter((item) => item.preview ?? item.image);
  const lead = pictured.find((item) => item.preview) ?? pictured[0] ?? null;
  const leadPreview = lead?.preview ?? lead?.image ?? null;
  const heroImage = heroChoice ?? (lead && leadPreview ? { ...leadPreview, alt: lead.altText } : null);
  const spotlight = pictured.find((item) => item !== lead) ?? lead;
  const films = [...featured, ...latest].filter((item, index, all) => item.mediaType === "VIDEO" && all.findIndex((other) => other.id === item.id) === index);
  const collageItems = uniqueById([...pictured, ...latest.filter((item) => item.preview ?? item.image)]).slice(0, 8);
  const recent = latest.filter((item) => item.image && item.id !== spotlight?.id).slice(0, 4);
  const aboutImage = portrait ?? (spotlight?.preview ? { ...spotlight.preview, alt: spotlight.altText } : null);

  return (
    <>
      {/* Banner */}
      <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden pt-[100px] md:pt-[140px] lg:pt-[170px] xl:pt-[220px] 2xl:pt-[230px]">
        {heroImage && (
          <MediaImage image={heroImage} alt={heroImage.alt} sizes="100vw" mode="fill" priority className="-z-[2]" />
        )}
        <div className="absolute inset-0 -z-[1] bg-gradient-to-b from-black/55 via-black/15 to-black/55" aria-hidden="true" />
        <div className="relative container lg:!max-w-full xl:!max-w-[1650px]">
          <div className="grid grid-cols-1 gap-[25px] lg:grid-cols-3">
            <div className="lg:col-span-2 lg:max-w-[650px] xl:max-w-[770px]">
              <span className="mb-[15px] inline-block rounded-[50px] border border-primary bg-white/10 px-[10px] py-[5px] text-sm text-white">{settings.tagline}</span>
              <h1 id="hero-heading" className="mb-0 text-4xl !text-white md:text-6xl lg:text-7xl xl:text-8xl">
                {settings.heroHeading}
              </h1>
            </div>
            <div className="lg:col-span-1 lg:ml-auto xl:max-w-[465px]">
              <p className="text-white md:text-base lg:text-lg">{settings.heroIntro}</p>
              <Link href="/gallery" className="primary-btn mt-[10px] md:mt-[15px]">
                Enter the gallery
              </Link>
            </div>
          </div>
          <div className="@container mt-[40px] overflow-hidden text-center leading-none xl:mt-[50px]" aria-hidden="true">
            <p
              className="relative top-[0.15em] !mb-0 bg-cover bg-clip-text bg-center bg-no-repeat leading-none font-bold text-transparent uppercase [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
              style={{
                // Fill the row like the template's six-letter wordmark, whatever the name's length.
                // Sized against the container (not the window) so it never overflows on wide screens.
                fontSize: `min(360px, ${(128 / Math.max(settings.siteName.length, 4)).toFixed(2)}cqw)`,
                // A warm tint keeps the photo-filled letters vivid even when the hero photo is dark.
                backgroundImage: heroImage
                  ? `linear-gradient(180deg, rgb(255 190 110 / 0.55), rgb(250 50 90 / 0.5)), url(${heroImage.src})`
                  : undefined,
                backgroundColor: heroImage ? undefined : "#fff",
              }}
            >
              {settings.siteName}
            </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section aria-labelledby="about-heading" className={`relative z-[1] bg-navy-black ${sectionPadding}`}>
        <div className="container">
          <div className="mb-[25px] grid grid-cols-1 gap-[25px] xl:mb-[55px] xl:grid-cols-3">
            <div className="xl:order-2 xl:col-span-1">
              <ul className="relative bg-primary px-[20px] py-[30px] text-white md:px-[30px] md:py-[40px] xl:-top-[120px] xl:-mb-[120px] xl:ml-[25px]">
                <HighlightRow icon={<RiImage2Line className="size-9" />} title={`${stats.photographs} photographs`} href={galleryHref({ type: "image" })}>
                  Landscapes, rooms and small things, noticed slowly.
                </HighlightRow>
                <HighlightRow icon={<RiFilmLine className="size-9" />} title={`${stats.films} short films`} href={galleryHref({ type: "video" })}>
                  Moving image, quiet and unhurried.
                </HighlightRow>
                <HighlightRow icon={<RiFolderImageLine className="size-9" />} title={`${collections.length} collections`} href="/gallery">
                  Series gathered by place, season or idea.
                </HighlightRow>
              </ul>
            </div>
            <div className="xl:order-1 xl:col-span-2">
              <h2 id="about-heading" className={`mb-0 ${sectionTitle}`}>
                {about.content.heading}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 items-center gap-[25px] lg:grid-cols-2">
            <div className="xl:mr-[105px]">
              {aboutImage && (
                <div className="relative aspect-[805/825] overflow-hidden">
                  <MediaImage image={aboutImage} alt={aboutImage.alt} sizes="(min-width: 1024px) 40vw, 100vw" mode="fill" />
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-semibold md:text-lg xl:text-xl">{about.content.intro}</p>
              <div className="my-[25px] grid grid-cols-1 items-center gap-[25px] md:my-[35px] md:grid-cols-2">
                <div className="border-white/20 md:border-r xl:mr-[35px]">
                  <Counter value={stats.photographs} label="Photographs" />
                  <Counter value={stats.films} label="Films" />
                  <Counter value={collections.length} label="Collections" />
                </div>
                <div>
                  <p>{about.content.philosophy || settings.description}</p>
                </div>
              </div>
              {spotlight && (
                <p>
                  The latest featured work, &ldquo;
                  <Link href={`/gallery/${spotlight.slug}`} className="text-primary hover:underline">
                    {spotlight.title}
                  </Link>
                  &rdquo;, {spotlight.caption ? spotlight.caption.charAt(0).toLowerCase() + spotlight.caption.slice(1) : "is waiting in the gallery."}
                </p>
              )}
              <Link href="/about" className="primary-btn mt-[10px] hover:!bg-black md:mt-[20px]">
                Read the story
              </Link>
            </div>
          </div>
        </div>
        <Shape src="/musfix/shape1.png" width={1920} height={851} className="top-0" />
      </section>

      {/* Selected work */}
      {spotlight && (
        <section aria-labelledby="selected-heading" className={`relative z-[1] overflow-hidden ${sectionPadding}`}>
          <div className="container">
            <h2 id="selected-heading" className={`mb-[25px] !text-white md:mb-[35px] lg:mb-[45px] xl:mb-[55px] xl:max-w-[1110px] ${sectionTitle}`}>
              Dive into the archive: every photograph, film and quiet observation
            </h2>
            <SpotlightWork item={spotlight} />
            <div className="py-[30px] md:py-[40px] lg:py-[50px] xl:py-[60px]" />
            <div className="mb-[25px] items-center justify-between sm:flex md:mb-[35px] lg:mb-[45px] xl:mb-[55px]">
              <h2 className={`mb-0 !text-white ${sectionTitle}`}>{collections.length > 0 ? "Collections" : "Recent work"}</h2>
              <Link href="/gallery" className="mt-[15px] inline-block font-medium text-primary transition-all duration-300 ease-in-out hover:text-white sm:mt-0">
                View all work
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-[25px] sm:grid-cols-2 lg:grid-cols-4">
              {collections.length > 0
                ? collections.slice(0, 4).map((collection) => <CollectionTile key={collection.id} collection={collection} />)
                : recent.map((item) => <WorkTile key={item.id} item={item} />)}
            </ul>
          </div>
          <Shape src="/musfix/shape2.png" width={1920} height={1497} className="top-1/2 -translate-y-1/2 opacity-60" />
        </section>
      )}

      {/* Films */}
      {films.length > 0 && (
        <section aria-labelledby="films-heading" className={`bg-navy-black ${sectionPadding}`}>
          <div className="container">
            <h2 id="films-heading" className={`mb-[25px] md:mb-[35px] lg:mb-[45px] xl:mb-[55px] ${sectionTitle}`}>
              Watch the latest short films, studies in light and moving water
            </h2>
            <FilmsShowcase films={films.slice(0, 3)} />
          </div>
        </section>
      )}

      {/* Text slider */}
      <div className="overflow-hidden border-b border-white/20 pb-[3px] text-4xl font-bold whitespace-nowrap sm:pb-[5px] sm:text-5xl md:pb-[8px] md:text-6xl lg:pb-[10px] lg:text-7xl xl:pb-[12px] xl:text-8xl" aria-hidden="true">
        <div className="marquee py-[20px] motion-reduce:animate-none md:py-[30px] lg:py-[40px]">
          Explore a visual journey through photographs, films and behind-the-frame moments
        </div>
      </div>

      {/* Gallery */}
      {collageItems.length > 0 && (
        <section aria-labelledby="gallery-heading" className="relative z-[2] pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[120px]">
          <GalleryCollage items={collageItems}>
            <div className="mx-auto my-[25px] text-center md:max-w-[550px] lg:my-0">
              <h2 id="gallery-heading" className={`mb-[15px] md:mb-[20px] ${sectionTitle}`}>
                Gallery
              </h2>
              <p className="font-semibold md:text-base lg:text-lg">Step behind the frame and revisit every season, light and place in the archive.</p>
              <Link href="/gallery" className="inline-block font-medium text-primary transition-all duration-300 ease-in-out hover:underline md:mt-[5px] lg:mt-[10px]">
                View all gallery
              </Link>
            </div>
          </GalleryCollage>
        </section>
      )}

      {/* Latest */}
      {recent.length > 0 && collections.length > 0 && (
        <section aria-labelledby="latest-heading" className={sectionPadding}>
          <div className="container">
            <div className="mb-[25px] items-center justify-between sm:flex md:mb-[35px] lg:mb-[45px] xl:mb-[55px]">
              <h2 id="latest-heading" className={`mb-0 ${sectionTitle}`}>
                Newly added
              </h2>
              <Link href="/gallery" className="mt-[15px] inline-block font-medium text-primary transition-all duration-300 ease-in-out hover:text-white sm:mt-0">
                Explore the archive
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-[25px] sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((item) => (
                <WorkTile key={item.id} item={item} />
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand
        title={about.content.ctaHeading || "Let’s make something together"}
        text={about.content.ctaText || "Commissions, collaborations and print enquiries are always welcome."}
        action={{ href: "/contact", label: "Get in touch" }}
      />
    </>
  );
}

function HighlightRow({ icon, title, href, children }: { icon: ReactNode; title: string; href: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-[15px] border-b border-dashed border-white/35 py-[20px] first:pt-0 last:border-b-0 last:pb-0 md:gap-[20px] md:py-[25px]">
      <span className="flex h-[75px] w-[75px] flex-none items-center justify-center rounded-full bg-black" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h3 className="mb-[8px] text-lg !font-semibold !text-white md:text-xl">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </h3>
        <p>{children}</p>
      </div>
    </li>
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

function SpotlightWork({ item }: { item: MediaCardData }) {
  const image = item.preview ?? item.image;
  return (
    <div className="grid grid-cols-1 items-center gap-[25px] lg:grid-cols-2">
      <div className="xl:mr-[105px]">
        {image && (
          <Link href={`/gallery/${item.slug}`} className="group relative block aspect-[805/525] overflow-hidden">
            <MediaImage image={image} alt={item.altText} sizes="(min-width: 1024px) 45vw, 100vw" mode="fill" className="transition-all duration-300 ease-in-out group-hover:scale-110" />
          </Link>
        )}
      </div>
      <div>
        <h3 className="mb-[15px] text-2xl !font-semibold !text-white md:text-4xl lg:mb-[20px] xl:text-5xl">{item.title}</h3>
        <p className="last:!mb-0 md:!mb-[20px]">
          <span className="text-base font-medium text-primary md:text-lg lg:text-xl">{item.category?.name ?? typeLabel(item)}</span>{" "}
          ({[item.publishedAt && `Published: ${formatDate(item.publishedAt)}`, typeLabel(item)].filter(Boolean).join(" • ")})
        </p>
        {item.caption && <p>{item.caption}</p>}
        <div className="mt-[25px] flex flex-wrap items-center gap-[20px] md:mt-[30px] md:gap-[25px] lg:mt-[35px]">
          <Link href={`/gallery/${item.slug}`} className="primary-btn">
            View work
          </Link>
          <Link href="/gallery" className="primary-btn with-border">
            Browse gallery
          </Link>
        </div>
      </div>
    </div>
  );
}

function CollectionTile({ collection }: { collection: PublicCollection }) {
  const href = galleryHref({ collection: collection.slug });
  return (
    <li className="group">
      <Link href={href} className="relative mb-[20px] block aspect-[805/525] overflow-hidden bg-navy-black md:mb-[25px]">
        {collection.cover && (
          <MediaImage image={collection.cover} alt={collection.cover.alt} sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" mode="fill" className="transition-all duration-300 ease-in-out group-hover:scale-110" />
        )}
      </Link>
      <h3 className="mb-[10px] text-lg !font-semibold !text-white md:text-xl">
        <Link href={href} className="transition-all duration-300 ease-in-out hover:text-primary">
          {collection.title}
        </Link>
      </h3>
      <DotList items={["Collection", `${collection.count} ${collection.count === 1 ? "work" : "works"}`]} />
    </li>
  );
}

function WorkTile({ item }: { item: MediaCardData }) {
  return (
    <li className="group">
      <Link href={`/gallery/${item.slug}`} className="relative mb-[20px] block aspect-[805/525] overflow-hidden bg-navy-black md:mb-[25px]">
        {item.image && (
          <MediaImage image={item.image} alt={item.altText} sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" mode="fill" className="transition-all duration-300 ease-in-out group-hover:scale-110" />
        )}
      </Link>
      <h3 className="mb-[10px] text-lg !font-semibold !text-white md:text-xl">
        <Link href={`/gallery/${item.slug}`} className="transition-all duration-300 ease-in-out hover:text-primary">
          {item.title}
        </Link>
      </h3>
      <DotList items={[item.publishedAt ? String(new Date(item.publishedAt).getFullYear()) : null, typeLabel(item), item.category?.name ?? null]} />
    </li>
  );
}

function DotList({ items }: { items: (string | null)[] }) {
  const shown = items.filter((item): item is string => Boolean(item));
  return (
    <ul className="flex flex-wrap items-center gap-[10px] text-[#a0a0a0]">
      {shown.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-center gap-[10px]">
          {index > 0 && <span className="h-[5px] w-[5px] rounded-full bg-[#a0a0a0]" aria-hidden="true" />}
          {item}
        </li>
      ))}
    </ul>
  );
}

function Shape({ src, width, height, className }: { src: string; width: number; height: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute right-0 left-0 -z-[1] mx-auto text-center ${className ?? ""}`} aria-hidden="true">
      <Image src={src} alt="" width={width} height={height} className="w-full" />
    </div>
  );
}

function typeLabel(item: MediaCardData) {
  return item.mediaType === "IMAGE" ? "Photograph" : item.mediaType === "VIDEO" ? "Film" : (item.providerLabel ?? "Link");
}

function uniqueById(items: MediaCardData[]) {
  return items.filter((item, index) => items.findIndex((other) => other.id === item.id) === index);
}

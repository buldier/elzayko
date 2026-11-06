import { RiArrowLeftLine, RiArrowRightLine, RiArrowRightUpLine, RiCalendarLine, RiFolderImageLine, RiPriceTag3Line } from "@remixicon/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { MediaCard } from "@/components/media/media-card";
import { DownloadButton, ShareButton } from "@/components/media/media-actions";
import { MediaImage } from "@/components/media/media-image";
import { MediaPlayer } from "@/components/media/media-player";
import { Skeleton } from "@/components/feedback/states";
import { PageBanner } from "@/components/site/page-banner";
import { galleryHref } from "@/features/media/gallery-url";
import { getMediaDetail, type MediaDetailPage } from "@/features/media/queries";
import type { MediaDetailData } from "@/features/media/types";
import { formatDate } from "@/lib/utils/format";

export async function generateMetadata({ params }: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getMediaDetail(slug);
  if (!detail) return { title: "Not found", robots: { index: false } };
  const { media } = detail;
  const image = media.displayImage ?? media.image;
  const description = media.caption ?? media.description?.slice(0, 200) ?? `${media.title} — Elzayko`;
  return {
    title: media.title,
    description,
    alternates: { canonical: `/gallery/${media.slug}` },
    openGraph: {
      type: media.mediaType === "VIDEO" ? "video.other" : "article",
      title: media.title,
      description,
      url: `/gallery/${media.slug}`,
      images: image ? [{ url: image.src, width: image.width, height: image.height, alt: media.altText }] : undefined,
    },
  };
}

export default function MediaDetailRoute({ params }: PageProps<"/gallery/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <MediaDetail params={params} />
    </Suspense>
  );
}

const sectionTitle = "text-[clamp(1.9rem,3.6vw,2.6rem)]";

async function MediaDetail({ params }: Pick<PageProps<"/gallery/[slug]">, "params">) {
  const { slug } = await params;
  const detail = await getMediaDetail(slug);
  if (!detail) notFound();
  const { media, neighbours, related } = detail;
  const canonicalUrl = `${process.env.SITE_URL ?? "http://localhost:3000"}/gallery/${media.slug}`;

  return (
    <article>
      <PageBanner
        title={media.title}
        crumbs={[
          { label: "Gallery", href: "/gallery" },
          ...(media.category ? [{ label: media.category.name, href: galleryHref({ category: media.category.slug }) }] : []),
          { label: typeLabel(media) },
        ]}
        image={null}
        intro={media.caption}
      />

      <div className="pt-6 pb-16 md:pb-24">
        <div>
          <div className="grid grid-cols-1 gap-10">
            <div>
              <MediaStage media={media} />
              <ul className="my-[15px] text-white/55 md:my-[20px]">
                <li className="mt-[8px] mr-[15px] inline-block text-white md:mr-[25px]">
                  Type: <span className="text-white/55">{typeLabel(media)}</span>
                </li>
                {media.publishedAt && (
                  <MetaItem icon={<RiCalendarLine className="size-4 text-white" />}>{formatDate(media.publishedAt)}</MetaItem>
                )}
                {media.category && (
                  <MetaItem icon={<RiFolderImageLine className="size-4 text-white" />}>
                    <Link href={galleryHref({ category: media.category.slug })} className="transition-all duration-300 ease-in-out hover:text-primary">
                      {media.category.name}
                    </Link>
                  </MetaItem>
                )}
                {media.tags.length > 0 && (
                  <MetaItem icon={<RiPriceTag3Line className="size-4 text-white" />}>
                    {media.tags.length} {media.tags.length === 1 ? "tag" : "tags"}
                  </MetaItem>
                )}
              </ul>
              {media.description &&
                media.description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index} className="text-white/55 md:!mb-[20px] md:last:!mb-0">
                    {paragraph}
                  </p>
                ))}
              <div className="mt-[25px] flex flex-wrap items-center gap-[15px] md:mt-[30px] md:gap-[20px]">
                {media.downloadUrl && <DownloadButton href={media.downloadUrl} title={media.title} />}
                {media.mediaType === "LINK" && media.externalUrl && (
                  <a href={media.externalUrl} target="_blank" rel="noopener noreferrer" className="primary-btn">
                    View on {media.providerLabel} <RiArrowRightUpLine className="size-4" aria-hidden="true" />
                  </a>
                )}
                <ShareButton url={canonicalUrl} title={media.title} />
              </div>
            </div>

            <aside className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[20px] border border-white/5 bg-[#161616] p-6 md:p-7">
                <h2 className="mb-[15px] border-b border-dashed border-white/20 pb-[5px] text-base !font-semibold md:mb-[20px] md:pb-[10px] md:text-lg lg:mb-[25px] lg:text-xl">
                  Details
                </h2>
                <dl className="text-white/55">
                  {media.publishedAt && <DetailRow label="Published">{formatDate(media.publishedAt)}</DetailRow>}
                  {media.category && (
                    <DetailRow label="Category">
                      <Link href={galleryHref({ category: media.category.slug })} className="hover:text-primary">
                        {media.category.name}
                      </Link>
                    </DetailRow>
                  )}
                  {media.collections.length > 0 && (
                    <DetailRow label={media.collections.length > 1 ? "Collections" : "Collection"}>
                      {media.collections.map((collection, index) => (
                        <span key={collection.slug}>
                          {index > 0 && ", "}
                          <Link href={galleryHref({ collection: collection.slug })} className="hover:text-primary">
                            {collection.title}
                          </Link>
                        </span>
                      ))}
                    </DetailRow>
                  )}
                  {media.mediaType === "IMAGE" && <DetailRow label="Download">{media.downloadUrl ? "Available" : "Not offered"}</DetailRow>}
                  {media.mediaType !== "IMAGE" && media.providerLabel && <DetailRow label="Source">{media.providerLabel}</DetailRow>}
                </dl>
              </div>
              {media.tags.length > 0 && (
                <div className="rounded-[20px] border border-white/5 bg-[#161616] p-6 md:p-7">
                  <h2 className="mb-[15px] border-b border-dashed border-white/20 pb-[5px] text-base !font-semibold md:mb-[20px] md:pb-[10px] md:text-lg lg:mb-[25px] lg:text-xl">
                    Tags
                  </h2>
                  <ul className="flex flex-wrap gap-[10px]">
                    {media.tags.map((tag) => (
                      <li key={tag.slug}>
                        <Link
                          href={galleryHref({ tag: tag.slug })}
                          className="inline-block rounded-full border border-white/10 px-[12px] py-[4px] text-sm text-white transition-all duration-300 ease-in-out hover:border-primary hover:bg-primary hover:text-black"
                        >
                          {tag.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>

          <Neighbours neighbours={neighbours} />

          {related.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-[60px] md:mt-[80px] lg:mt-[100px]">
              <h2 id="related-heading" className={`mb-[25px] md:mb-[35px] lg:mb-[45px] ${sectionTitle}`}>
                Related work
              </h2>
              <ul className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2">
                {related.map((item) => (
                  <li key={item.id}>
                    <MediaCard media={item} sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

function MediaStage({ media }: { media: MediaDetailData }) {
  if (media.mediaType === "VIDEO" && media.videoSrc) {
    return (
      <MediaPlayer
        kind="upload"
        src={media.videoSrc}
        mimeType={media.videoMime}
        poster={media.displayImage}
        title={media.title}
        width={media.displayImage?.width ?? null}
        height={media.displayImage?.height ?? null}
      />
    );
  }
  if (media.mediaType === "VIDEO" && media.embedUrl) {
    return <MediaPlayer kind="embed" embedUrl={media.embedUrl} poster={media.displayImage} title={media.title} providerLabel={media.providerLabel ?? "YouTube"} />;
  }
  if (media.mediaType === "LINK") {
    return (
      <a
        href={media.externalUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-[22rem] flex-col justify-between rounded-[20px] bg-[#161616] p-[30px] ring-1 ring-white/5 transition-all duration-300 ease-in-out hover:bg-primary md:min-h-[26rem] md:p-[44px]"
      >
        <span className="inline-flex items-center gap-2 font-medium text-primary group-hover:text-black">
          {media.providerLabel} <RiArrowRightUpLine className="size-5" aria-hidden="true" />
        </span>
        <span className="max-w-3xl text-3xl font-medium tracking-[-0.03em] text-white group-hover:text-black md:text-4xl">{media.caption ?? media.title}</span>
        <span className="text-sm break-all text-white/45 group-hover:text-black/70">{media.externalUrl}</span>
      </a>
    );
  }
  if (media.displayImage) {
    return (
      <figure className="flex justify-center overflow-hidden rounded-[20px] bg-[#161616] ring-1 ring-white/5">
        <div className="w-full" style={{ maxWidth: `min(100%, calc(80vh * ${media.displayImage.width / media.displayImage.height}))` }}>
          <MediaImage image={media.displayImage} alt={media.altText} sizes="(min-width: 1024px) 720px, 100vw" priority />
        </div>
      </figure>
    );
  }
  return null;
}

function MetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="relative mt-[8px] mr-[15px] inline-block pl-[22px] last:mr-0 md:mr-[25px] md:pl-[25px]">
      <span className="absolute top-1/2 left-0 -mt-px -translate-y-1/2" aria-hidden="true">
        {icon}
      </span>
      {children}
    </li>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-[15px] last:mb-0 md:mb-[20px]">
      <dt className="mb-[5px] block font-semibold text-white">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Neighbours({ neighbours }: { neighbours: MediaDetailPage["neighbours"] }) {
  if (!neighbours.previous && !neighbours.next) return null;
  return (
    <nav aria-label="More work" className="mt-[40px] grid grid-cols-2 gap-[25px] border-y border-white/10 py-[25px] md:mt-[60px] md:py-[30px]">
      <div>
        {neighbours.previous && (
          <Link href={`/gallery/${neighbours.previous.slug}`} rel="prev" className="group inline-flex items-center gap-[15px]">
            <span className="flex size-[45px] flex-none items-center justify-center rounded-full border border-white/30 transition-all duration-300 ease-in-out group-hover:border-primary group-hover:bg-primary group-hover:text-black md:size-[50px]">
              <RiArrowLeftLine className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm text-white/55">Newer</span>
              <span className="font-semibold text-white group-hover:text-primary md:text-lg">{neighbours.previous.title}</span>
            </span>
          </Link>
        )}
      </div>
      <div className="text-right">
        {neighbours.next && (
          <Link href={`/gallery/${neighbours.next.slug}`} rel="next" className="group inline-flex items-center gap-[15px]">
            <span>
              <span className="block text-sm text-white/55">Older</span>
              <span className="font-semibold text-white group-hover:text-primary md:text-lg">{neighbours.next.title}</span>
            </span>
            <span className="flex size-[45px] flex-none items-center justify-center rounded-full border border-white/30 transition-all duration-300 ease-in-out group-hover:border-primary group-hover:bg-primary group-hover:text-black md:size-[50px]">
              <RiArrowRightLine className="size-5" aria-hidden="true" />
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

function typeLabel(media: MediaDetailData) {
  return media.mediaType === "IMAGE" ? "Photograph" : media.mediaType === "VIDEO" ? "Film" : (media.providerLabel ?? "Link");
}

function DetailSkeleton() {
  return (
    <div className="pt-24 pb-24 opacity-20" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-14 w-2/3" />
      <Skeleton className="mt-6 h-4 w-48" />
      <div className="mt-16 grid gap-6">
        <Skeleton className="h-[50vh]" />
        <Skeleton className="h-60" />
      </div>
    </div>
  );
}

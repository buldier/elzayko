import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MediaCard } from "@/components/media/media-card";
import { DownloadButton, ShareButton } from "@/components/media/media-actions";
import { MediaImage } from "@/components/media/media-image";
import { MediaPlayer } from "@/components/media/media-player";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Skeleton } from "@/components/feedback/states";
import { buttonVariants } from "@/components/ui/button";
import { galleryHref } from "@/features/media/gallery-url";
import { getMediaDetail, type MediaDetailPage } from "@/features/media/queries";
import type { MediaDetailData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";
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

async function MediaDetail({ params }: Pick<PageProps<"/gallery/[slug]">, "params">) {
  const { slug } = await params;
  const detail = await getMediaDetail(slug);
  if (!detail) notFound();
  const { media, neighbours, related } = detail;
  const canonicalUrl = `${process.env.SITE_URL ?? "http://localhost:3000"}/gallery/${media.slug}`;

  return (
    <article className="pb-24">
      <div className="page-container pt-6 pb-8 md:pt-10">
        <Breadcrumbs
          items={[
            { label: "Gallery", href: "/gallery" },
            ...(media.category ? [{ label: media.category.name, href: galleryHref({ category: media.category.slug }) }] : []),
            { label: media.title },
          ]}
        />
      </div>

      <div className="page-container">
        <MediaStage media={media} />
      </div>

      <div className="page-container mt-12 grid gap-12 md:mt-16 md:grid-cols-12">
        <header className="md:col-span-7">
          <p className="eyebrow mb-4">
            {media.mediaType === "IMAGE" ? "Photograph" : media.mediaType === "VIDEO" ? "Film" : media.providerLabel}
          </p>
          <h1 className="text-headline">{media.title}</h1>
          {media.caption && <p className="mt-5 font-display text-2xl leading-snug text-ink-soft italic">{media.caption}</p>}
          {media.description && (
            <div className="mt-8 max-w-2xl space-y-4 text-[1.05rem] leading-relaxed text-ink-soft">
              {media.description.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            {media.downloadUrl && <DownloadButton href={media.downloadUrl} title={media.title} />}
            {media.mediaType === "LINK" && media.externalUrl && (
              <a href={media.externalUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "primary" }))}>
                View on {media.providerLabel} <ArrowUpRight aria-hidden="true" />
              </a>
            )}
            <ShareButton url={canonicalUrl} title={media.title} />
          </div>
        </header>

        <aside className="md:col-span-4 md:col-start-9">
          <dl className="divide-y divide-line border-y border-line text-sm">
            {media.publishedAt && <MetaRow label="Published" value={formatDate(media.publishedAt)} />}
            {media.category && (
              <MetaRow
                label="Category"
                value={<Link href={galleryHref({ category: media.category.slug })} className="link-underline">{media.category.name}</Link>}
              />
            )}
            {media.collections.length > 0 && (
              <MetaRow
                label={media.collections.length > 1 ? "Collections" : "Collection"}
                value={
                  <span className="flex flex-col items-end gap-1">
                    {media.collections.map((collection) => (
                      <Link key={collection.slug} href={galleryHref({ collection: collection.slug })} className="link-underline">
                        {collection.title}
                      </Link>
                    ))}
                  </span>
                }
              />
            )}
            {media.mediaType === "IMAGE" && (
              <MetaRow label="Download" value={media.downloadUrl ? "Available" : "Not offered"} />
            )}
          </dl>
          {media.tags.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow mb-3">Tags</p>
              <ul className="flex flex-wrap gap-2">
                {media.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link
                      href={galleryHref({ tag: tag.slug })}
                      className="inline-block rounded-full border border-line-strong px-3 py-1 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
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
        <section aria-labelledby="related-heading" className="page-container mt-20 border-t border-line pt-16">
          <h2 id="related-heading" className="text-title mb-10">
            Related work
          </h2>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <MediaCard media={item} sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      )}
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
    return (
      <div className="mx-auto max-w-6xl">
        <MediaPlayer kind="embed" embedUrl={media.embedUrl} poster={media.displayImage} title={media.title} providerLabel={media.providerLabel ?? "YouTube"} />
      </div>
    );
  }
  if (media.mediaType === "LINK") {
    return (
      <a
        href={media.externalUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-[22rem] flex-col justify-between border border-line bg-paper-raised p-8 transition-colors hover:bg-paper-sunk md:min-h-[30rem] md:p-14"
      >
        <span className="eyebrow inline-flex items-center gap-2 text-rosewood">
          {media.providerLabel} <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
        <span className="max-w-3xl font-display text-4xl leading-tight text-ink italic md:text-6xl">{media.caption ?? media.title}</span>
        <span className="text-sm break-all text-muted">{media.externalUrl}</span>
      </a>
    );
  }
  if (media.displayImage) {
    return (
      <figure className="flex justify-center bg-paper-sunk/60">
        <div className="w-full" style={{ maxWidth: `min(100%, calc(82vh * ${media.displayImage.width / media.displayImage.height}))` }}>
          <MediaImage image={media.displayImage} alt={media.altText} sizes="(min-width: 1280px) 80vw, 100vw" priority />
        </div>
      </figure>
    );
  }
  return null;
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

function Neighbours({ neighbours }: { neighbours: MediaDetailPage["neighbours"] }) {
  if (!neighbours.previous && !neighbours.next) return null;
  return (
    <nav aria-label="More work" className="page-container mt-20 grid grid-cols-2 gap-6 border-t border-line pt-8">
      <div>
        {neighbours.previous && (
          <Link href={`/gallery/${neighbours.previous.slug}`} rel="prev" className="group inline-flex flex-col gap-1">
            <span className="inline-flex items-center gap-2 text-xs tracking-[0.16em] text-muted uppercase">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Newer
            </span>
            <span className="font-display text-xl">{neighbours.previous.title}</span>
          </Link>
        )}
      </div>
      <div className="text-right">
        {neighbours.next && (
          <Link href={`/gallery/${neighbours.next.slug}`} rel="next" className="group inline-flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-2 text-xs tracking-[0.16em] text-muted uppercase">
              Older <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl">{neighbours.next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

function DetailSkeleton() {
  return (
    <div className="page-container pt-10 pb-24" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="mt-8 h-[60vh] w-full" />
      <div className="mt-12 grid gap-12 md:grid-cols-12">
        <div className="space-y-4 md:col-span-7">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>
        <div className="space-y-3 md:col-span-4 md:col-start-9">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

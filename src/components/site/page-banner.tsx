import { RiArrowRightSLine } from "@remixicon/react";
import Link from "next/link";
import { Fragment } from "react";
import { BlurText, Fade } from "@/components/isak/motion/reveal";
import { MediaImage } from "@/components/media/media-image";
import { getFeaturedMedia } from "@/features/media/queries";
import type { MediaImage as MediaImageData } from "@/features/media/types";

export type Crumb = { label: string; href?: string };

type Props = {
  title: string;
  crumbs: Crumb[];
  /** Photo shown under the title; defaults to one of the featured works. Pass null for none. */
  image?: (MediaImageData & { alt: string }) | null;
  /** Which featured work to borrow when no image is given, so pages vary. */
  featuredIndex?: number;
  intro?: string | null;
};

/** Inner-page header: breadcrumb pill, blur-in title, optional lead text and a framed photo. */
export async function PageBanner({ title, crumbs, image, featuredIndex = 0, intro }: Props) {
  const photo = image === undefined ? await featuredPhoto(featuredIndex) : image;

  return (
    <header className="pt-12 pb-6 lg:pt-24">
      <Fade className="mb-6">
        <nav aria-label="Breadcrumb">
          <ol className="inline-flex flex-wrap items-center gap-1 rounded-full border border-white/5 bg-white/[0.06] px-3 py-1 text-xs font-medium tracking-wide text-white/70 uppercase">
            {[{ label: "Home", href: "/" }, ...crumbs].map((crumb, index) => (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 && (
                  <li aria-hidden="true">
                    <RiArrowRightSLine className="size-3.5 text-primary" />
                  </li>
                )}
                <li>
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-primary">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white/90">
                      {crumb.label}
                    </span>
                  )}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
      </Fade>
      <BlurText
        as="h1"
        className="max-w-[640px] text-[clamp(2.4rem,5vw,4rem)] !leading-[1.05] !text-white/85"
      >
        {title}
      </BlurText>
      {intro && (
        <Fade as="p" className="mt-6 max-w-[560px] text-white/55">
          {intro}
        </Fade>
      )}
      {photo && (
        <Fade variant="zoom" className="mt-10">
          <div className="relative aspect-[16/8] overflow-hidden rounded-[20px] ring-1 ring-white/10">
            <MediaImage
              image={photo}
              alt={photo.alt}
              sizes="(min-width: 1024px) 720px, 100vw"
              mode="fill"
              priority
            />
          </div>
        </Fade>
      )}
    </header>
  );
}

async function featuredPhoto(index: number) {
  const featured = (await getFeaturedMedia(8)).filter((item) => item.preview ?? item.image);
  const item = featured[index % Math.max(featured.length, 1)];
  const image = item?.preview ?? item?.image;
  return item && image ? { ...image, alt: item.altText } : null;
}

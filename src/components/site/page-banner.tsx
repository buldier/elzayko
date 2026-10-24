import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { MediaImage } from "@/components/media/media-image";
import { getFeaturedMedia } from "@/features/media/queries";
import type { MediaImage as MediaImageData } from "@/features/media/types";
import { getSiteSettings } from "@/features/settings/service";

export type Crumb = { label: string; href?: string };

type Props = {
  title: string;
  crumbs: Crumb[];
  /** Photo shown beside the title; defaults to one of the featured works. */
  image?: (MediaImageData & { alt: string }) | null;
  /** Which featured work to borrow when no image is given, so pages vary. */
  featuredIndex?: number;
};

/** Inner-page banner: title and breadcrumb on the left, a framed photo with contact details on the right. */
export async function PageBanner({ title, crumbs, image, featuredIndex = 0 }: Props) {
  const [settings, photo] = await Promise.all([getSiteSettings(), image === undefined ? featuredPhoto(featuredIndex) : image]);

  return (
    <div className="relative z-[1] bg-black pt-[100px] text-white md:pt-[125px] lg:pt-[125px] xl:pt-[130px]">
      <div className="container lg:!max-w-full xl:!max-w-[1650px]">
        <div className="grid grid-cols-1 items-center gap-[25px] lg:grid-cols-2">
          <div>
            <div className="lg:ml-auto lg:max-w-[455px] xl:max-w-[630px]">
              <h1 className="mb-[10px] text-3xl !text-white md:mb-[15px] md:text-5xl lg:mb-[20px] lg:text-6xl xl:text-[64px]">{title}</h1>
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-[15px] md:text-base lg:text-lg">
                  {[{ label: "Home", href: "/" }, ...crumbs].map((crumb, index) => (
                    <Fragment key={`${crumb.label}-${index}`}>
                      {index > 0 && (
                        <li aria-hidden="true">
                          <div className="h-[15px] w-[2px] rotate-[15deg] bg-white md:h-[20px]" />
                        </li>
                      )}
                      <li>
                        {crumb.href ? (
                          <Link href={crumb.href} className="transition-all duration-300 ease-in-out hover:text-primary">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span aria-current="page">{crumb.label}</span>
                        )}
                      </li>
                    </Fragment>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
          {photo && (
            <div className="relative aspect-[860/375] overflow-hidden xl:ml-auto xl:w-full xl:max-w-[575px]">
              <MediaImage image={photo} alt={photo.alt} sizes="(min-width: 1280px) 575px, (min-width: 1024px) 50vw, 100vw" mode="fill" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
              {(settings.contactEmail || settings.location) && (
                <ul className="absolute right-0 bottom-0 left-0 flex flex-wrap gap-[15px] p-[15px] sm:gap-[20px] sm:p-[20px] md:gap-[30px] md:p-[30px] xl:gap-[50px]">
                  {settings.location && (
                    <li>
                      <span className="mb-[3px] block">Based In</span>
                      <span className="font-bold md:text-lg lg:text-xl">{settings.location}</span>
                    </li>
                  )}
                  {settings.contactEmail && (
                    <li>
                      <span className="mb-[3px] block">Email Us</span>
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="font-bold break-all transition-all duration-300 ease-in-out hover:text-primary md:text-lg lg:text-xl"
                      >
                        {settings.contactEmail}
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute top-0 right-0 left-0 -z-[2] mx-auto text-center" aria-hidden="true">
        <Image src="/musfix/shape13.png" alt="" width={1920} height={611} priority className="w-full" />
      </div>
    </div>
  );
}

async function featuredPhoto(index: number) {
  const featured = (await getFeaturedMedia(8)).filter((item) => item.preview ?? item.image);
  const item = featured[index % Math.max(featured.length, 1)];
  const image = item?.preview ?? item?.image;
  return item && image ? { ...image, alt: item.altText } : null;
}

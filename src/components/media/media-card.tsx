import { RiArrowRightUpLine, RiPlayFill } from "@remixicon/react";
import Link from "next/link";
import type { MediaCardData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/format";
import { MediaImage } from "./media-image";

type Props = {
  media: MediaCardData;
  sizes?: string;
  priority?: boolean;
  className?: string;
  showMeta?: boolean;
};

const DEFAULT_SIZES = "(min-width: 1280px) 420px, (min-width: 640px) 45vw, 100vw";

/** Public media tile in the template's card style: fixed-ratio image, title and dotted meta. Pure markup. */
export function MediaCard({ media, sizes = DEFAULT_SIZES, priority, className, showMeta = true }: Props) {
  const isLink = media.mediaType === "LINK";
  const href = `/gallery/${media.slug}`;
  return (
    <article className={cn("group relative", className)}>
      <Link
        href={href}
        className="relative block aspect-[525/290] overflow-hidden bg-navy-black"
        aria-label={`${media.title}${media.mediaType === "VIDEO" ? " (video)" : isLink ? ` (${media.providerLabel} link)` : ""}`}
      >
        {media.image ? (
          <MediaImage
            image={media.image}
            alt={media.altText}
            sizes={sizes}
            priority={priority}
            mode="fill"
            className="transition-all duration-300 ease-in-out group-hover:scale-110 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span className="absolute inset-0 flex flex-col justify-between p-[20px] md:p-[25px]">
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              {media.providerLabel ?? "Link"}
              <RiArrowRightUpLine className="size-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold text-white md:text-xl">{media.caption ?? media.title}</span>
          </span>
        )}

        {media.mediaType === "VIDEO" && (
          <span className="absolute bottom-[10px] left-[10px] inline-flex items-center gap-[5px] rounded-[50px] bg-primary px-[12px] py-[5px] text-sm font-medium text-white">
            <RiPlayFill className="size-4" aria-hidden="true" />
            {media.duration ? formatDuration(media.duration) : (media.providerLabel ?? "Film")}
          </span>
        )}
      </Link>

      {showMeta && (
        <div className="mt-[20px] md:mt-[25px]">
          <h3 className="mb-[10px] text-lg !font-semibold !text-white md:text-xl">
            <Link href={href} className="transition-all duration-300 ease-in-out hover:text-primary" tabIndex={-1}>
              {media.title}
            </Link>
          </h3>
          <ul className="flex flex-wrap items-center gap-[10px] text-[#a0a0a0]">
            {[typeLabel(media), media.category?.name, media.publishedAt ? String(new Date(media.publishedAt).getFullYear()) : null]
              .filter((value): value is string => Boolean(value))
              .map((value, index) => (
                <li key={`${value}-${index}`} className="flex items-center gap-[10px]">
                  {index > 0 && <span className="h-[5px] w-[5px] rounded-full bg-[#a0a0a0]" aria-hidden="true" />}
                  {value}
                </li>
              ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function typeLabel(media: MediaCardData) {
  return media.mediaType === "IMAGE" ? "Photograph" : media.mediaType === "VIDEO" ? "Film" : (media.providerLabel ?? "Link");
}

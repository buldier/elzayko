import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import type { MediaCardData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/format";
import { MediaImage } from "./media-image";

type Props = {
  media: MediaCardData;
  sizes?: string;
  priority?: boolean;
  /** "natural" for masonry, "fill" for fixed editorial frames. */
  mode?: "natural" | "fill";
  className?: string;
  showMeta?: boolean;
};

const DEFAULT_SIZES = "(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw";

/** Public media tile. Pure markup: usable from Server and Client Components. */
export function MediaCard({ media, sizes = DEFAULT_SIZES, priority, mode = "natural", className, showMeta = true }: Props) {
  const isLink = media.mediaType === "LINK";
  return (
    <article className={cn("group relative", className)}>
      <Link
        href={`/gallery/${media.slug}`}
        className={cn("relative block overflow-hidden bg-paper-sunk", mode === "fill" && "h-full")}
        aria-label={`${media.title}${media.mediaType === "VIDEO" ? " (video)" : isLink ? ` (${media.providerLabel} link)` : ""}`}
      >
        {media.image ? (
          <div
            className={cn(
              "relative transition-transform duration-(--duration-slow) ease-out-soft group-hover:scale-[1.025] motion-reduce:group-hover:scale-100",
              mode === "fill" && "absolute inset-0",
            )}
          >
            <MediaImage
              image={media.image}
              alt={media.altText}
              sizes={sizes}
              priority={priority}
              mode={mode}
              className={media.sourceType === "EXTERNAL" && mode === "natural" ? "aspect-video object-cover" : undefined}
            />
          </div>
        ) : (
          <LinkPlaceholder media={media} fill={mode === "fill"} />
        )}

        {media.mediaType === "VIDEO" && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.12em] text-paper uppercase backdrop-blur-sm">
            <Play className="size-3 fill-current" aria-hidden="true" />
            {media.duration ? formatDuration(media.duration) : (media.providerLabel ?? "Film")}
          </span>
        )}
      </Link>

      {showMeta && (
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[1.35rem] leading-snug text-ink">
            <Link href={`/gallery/${media.slug}`} className="link-underline" tabIndex={-1}>
              {media.title}
            </Link>
          </h3>
          {media.category && (
            <span className="shrink-0 text-[0.68rem] font-semibold tracking-[0.16em] text-muted uppercase">{media.category.name}</span>
          )}
        </div>
      )}
    </article>
  );
}

function LinkPlaceholder({ media, fill }: { media: MediaCardData; fill: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between border border-line bg-paper-raised p-6 transition-colors duration-(--duration-base) group-hover:bg-paper-sunk",
        fill ? "absolute inset-0" : "aspect-[4/3]",
      )}
    >
      <span className="eyebrow inline-flex items-center gap-1.5 text-rosewood">
        {media.providerLabel ?? "Link"}
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </span>
      <p className="font-display text-2xl leading-tight text-ink italic">{media.caption ?? media.title}</p>
    </div>
  );
}

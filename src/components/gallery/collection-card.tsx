import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MediaImage } from "@/components/media/media-image";
import type { PublicCollection } from "@/features/collections/service";
import { galleryHref } from "@/features/media/gallery-url";
import { cn } from "@/lib/utils/cn";

export function CollectionCard({ collection, tone = "default" }: { collection: PublicCollection; tone?: "default" | "inverse" }) {
  const inverse = tone === "inverse";
  return (
    <Link href={galleryHref({ collection: collection.slug })} className="group block">
      <div className={cn("relative aspect-[4/5] overflow-hidden", inverse ? "bg-ink-soft" : "bg-paper-sunk")}>
        {collection.cover && (
          <MediaImage
            image={collection.cover}
            alt={collection.cover.alt}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            mode="fill"
            className="transition-transform duration-[1200ms] ease-out-soft group-hover:scale-[1.04]"
          />
        )}
        <span className="absolute top-4 left-4 rounded-full bg-paper/90 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-ink uppercase backdrop-blur-sm">
          {collection.count} {collection.count === 1 ? "work" : "works"}
        </span>
      </div>
      <div className={cn("mt-5 flex items-start justify-between gap-4 border-t pt-4", inverse ? "border-paper/15" : "border-line")}>
        <div>
          <h3 className="font-display text-[1.75rem] leading-tight">{collection.title}</h3>
          {collection.description && (
            <p className={cn("mt-1.5 line-clamp-2 text-sm", inverse ? "text-paper/65" : "text-muted")}>{collection.description}</p>
          )}
        </div>
        <span
          className={cn(
            "mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-(--duration-base)",
            inverse ? "border-paper/30 group-hover:bg-paper group-hover:text-ink" : "border-line-strong group-hover:bg-ink group-hover:text-paper",
          )}
          aria-hidden="true"
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

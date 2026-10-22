import { MediaCard } from "@/components/media/media-card";
import type { MediaCardData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";

/**
 * Hand-composed asymmetric layout for the homepage's selected work.
 * Frames have fixed proportions so the rhythm holds regardless of source aspect ratios.
 */
const FRAMES = [
  { className: "md:col-span-7", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 55vw, 100vw" },
  { className: "md:col-span-5 md:pt-28", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 38vw, 100vw" },
  { className: "md:col-span-5", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 38vw, 100vw" },
  { className: "md:col-span-7 md:pt-20", aspect: "aspect-[3/2]", sizes: "(min-width: 768px) 55vw, 100vw" },
  { className: "md:col-span-6", aspect: "aspect-[4/3]", sizes: "(min-width: 768px) 46vw, 100vw" },
  { className: "md:col-span-6 md:pt-16", aspect: "aspect-[4/3]", sizes: "(min-width: 768px) 46vw, 100vw" },
] as const;

export function EditorialGrid({ items }: { items: MediaCardData[] }) {
  return (
    <ol className="grid gap-x-10 gap-y-16 sm:grid-cols-2 md:grid-cols-12 md:gap-y-24">
      {items.slice(0, FRAMES.length).map((item, index) => {
        const frame = FRAMES[index]!;
        return (
          <li key={item.id} className={cn(frame.className, index === 0 && "sm:col-span-2 md:col-span-7")}>
            <div className={cn("relative", frame.aspect)}>
              <MediaCard media={item} mode="fill" sizes={frame.sizes} showMeta={false} className="absolute inset-0" />
            </div>
            <div className="mt-5 grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 border-t border-line pt-4">
              <span className="text-xs font-semibold text-muted tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl leading-tight md:text-[1.7rem]">{item.title}</h3>
              {item.category && (
                <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted uppercase">{item.category.name}</span>
              )}
              {item.caption && <p className="col-start-2 col-end-4 mt-1.5 max-w-md text-sm text-muted">{item.caption}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

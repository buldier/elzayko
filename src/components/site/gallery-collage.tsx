import Link from "next/link";
import type { ReactNode } from "react";
import { MediaImage } from "@/components/media/media-image";
import type { MediaCardData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";

/**
 * The template's scattered photo collage: three frames on top, an optional centred
 * block, then five overlapping frames on a wider row. Frame proportions are fixed
 * so the composition holds whatever the source aspect ratios.
 */
export function GalleryCollage({ items, children }: { items: MediaCardData[]; children?: ReactNode }) {
  const [a, b, c, d, e, f, g, h] = items.filter((item) => item.preview ?? item.image);
  return (
    <>
      <div className="container">
        <div className="grid grid-cols-1 gap-[25px] md:grid-cols-3">
          <Frame item={a} aspect="aspect-[635/375]" />
          <Frame item={b} aspect="aspect-[400/250]" className="md:ml-auto md:w-full md:max-w-[200px]" />
          <Frame item={c} aspect="aspect-[470/300]" className="md:ml-auto md:w-full md:max-w-[315px]" />
        </div>
        {children}
      </div>
      <div className="container mt-[25px] lg:!max-w-full xl:!max-w-[1650px]">
        <div className="grid grid-cols-1 items-end gap-[25px] md:grid-cols-3">
          <div>
            <Frame item={d} aspect="aspect-[635/400]" className="xl:max-w-[425px]" />
            <Frame
              item={e}
              aspect="aspect-[635/400]"
              className="relative mt-[25px] md:-mt-[40px] md:ml-auto md:max-w-[115px] lg:-mt-[60px] lg:max-w-[215px] xl:-mt-[100px] xl:max-w-[315px]"
            />
          </div>
          <div className="xl:pb-[50px]">
            <Frame item={f} aspect="aspect-[470/290]" className="md:mx-auto xl:max-w-[310px]" />
            <Frame
              item={g}
              aspect="aspect-[495/350]"
              className="relative mt-[25px] md:-mt-[25px] md:ml-auto md:max-w-[120px] lg:-mt-[50px] lg:max-w-[200px] xl:-mt-[80px] xl:max-w-[250px]"
            />
          </div>
          <Frame item={h} aspect="aspect-[525/600]" className="md:mx-auto xl:max-w-[350px]" />
        </div>
      </div>
    </>
  );
}

function Frame({ item, aspect, className }: { item: MediaCardData | undefined; aspect: string; className?: string }) {
  const image = item?.preview ?? item?.image;
  if (!item || !image) return null;
  return (
    <Link href={`/gallery/${item.slug}`} className={cn("group block w-full overflow-hidden", className)} aria-label={item.title}>
      <div className={cn("relative", aspect)}>
        <MediaImage
          image={image}
          alt={item.altText}
          sizes="(min-width: 1280px) 425px, (min-width: 768px) 33vw, 100vw"
          mode="fill"
          className="transition-all duration-300 ease-in-out group-hover:scale-110"
        />
      </div>
    </Link>
  );
}

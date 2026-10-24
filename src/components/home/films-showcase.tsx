"use client";

import { RiCalendarLine, RiPlayFill, RiTimeLine } from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";
import { MediaImage } from "@/components/media/media-image";
import type { MediaCardData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatDuration } from "@/lib/utils/format";

/** The template's video slider: one large feature with thumbnail tabs underneath. */
export function FilmsShowcase({ films }: { films: MediaCardData[] }) {
  const [active, setActive] = useState(0);
  const film = films[active];
  if (!film) return null;
  const poster = film.preview ?? film.image;

  return (
    <div>
      <div className="group relative bg-navy-black">
        <div className="relative aspect-[1320/700]">
          {poster && <MediaImage key={film.id} image={poster} alt={film.altText} sizes="(min-width: 1280px) 1284px, 100vw" mode="fill" className="animate-fade-in" />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, #000000 100%)" }} />
        </div>
        <Link
          href={`/gallery/${film.slug}`}
          aria-label={`Watch ${film.title}`}
          className="absolute top-1/2 left-1/2 z-[1] -mt-[40px] hidden h-[83px] w-[83px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-black transition-all duration-300 ease-in-out hover:bg-primary hover:text-white lg:flex"
        >
          <RiPlayFill className="size-9" aria-hidden="true" />
        </Link>
        <div className="right-0 bottom-0 left-0 z-[1] mt-[15px] md:absolute md:mt-0 md:p-[30px] lg:p-[40px] xl:p-[50px]">
          <h3 className="mb-[2px] text-lg !font-semibold md:mb-[5px] md:text-xl md:!text-white">
            <Link href={`/gallery/${film.slug}`} className="transition-all duration-300 ease-in-out hover:text-primary">
              {film.title}
            </Link>
          </h3>
          <ul className="md:text-[#a0a0a0]">
            {film.publishedAt && (
              <MetaItem icon={<RiCalendarLine className="size-4 md:text-white" aria-hidden="true" />}>Published: {formatDate(film.publishedAt)}</MetaItem>
            )}
            <MetaItem icon={<RiTimeLine className="size-4 md:text-white" aria-hidden="true" />}>
              {film.duration ? formatDuration(film.duration) : (film.providerLabel ?? "Film")}
            </MetaItem>
          </ul>
        </div>
      </div>

      {films.length > 1 && (
        <ul className="mt-[15px] grid grid-cols-1 gap-[15px] sm:grid-cols-3 md:mt-[20px]" role="tablist" aria-label="Choose a film">
          {films.slice(0, 3).map((item, index) => {
            const selected = index === active;
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(index)}
                  className="group/tab relative flex w-full items-center gap-[15px] pb-[15px] text-left md:pb-[20px]"
                >
                  <span
                    className={cn(
                      "flex size-[45px] flex-none items-center justify-center border text-xl transition-all duration-300 ease-in-out md:size-[50px]",
                      selected ? "border-primary bg-primary text-white" : "border-white/20 bg-navy-black text-primary group-hover/tab:border-primary",
                    )}
                  >
                    <RiPlayFill className="size-6" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="mb-[3px] block font-semibold text-white">{item.title}</span>
                    <span className="block text-sm text-[#a0a0a0]">
                      {item.category?.name ?? "Film"}
                      {item.publishedAt && ` • ${new Date(item.publishedAt).getFullYear()}`}
                    </span>
                  </span>
                  <span className={cn("absolute right-0 bottom-0 left-0 h-[2px] transition-all", selected ? "bg-primary" : "bg-white/20")} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="relative mt-[8px] mr-[15px] inline-block pl-[22px] last:mr-0 md:mr-[25px] md:pl-[25px]">
      <span className="absolute top-1/2 left-0 -mt-px -translate-y-1/2">{icon}</span>
      {children}
    </li>
  );
}

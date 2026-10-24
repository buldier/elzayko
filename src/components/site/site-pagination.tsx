import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Props = {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
};

/** Compact page list: 1 … 4 5 6 … 12 */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1]! > 1) result.push("gap");
    result.push(value);
  });
  return result;
}

const circle =
  "flex h-[45px] w-[45px] items-center justify-center rounded-full border border-white/30 text-white transition-all duration-300 ease-in-out hover:border-primary hover:bg-primary md:h-[50px] md:w-[50px]";

/** Round page buttons, in the style of the template's slider controls. */
export function SitePagination({ page, pageCount, hrefFor }: Props) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-[10px]">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} rel="prev" className={circle} aria-label="Newer">
          <RiArrowLeftLine className="size-5" aria-hidden="true" />
        </Link>
      )}
      {pageWindow(page, pageCount).map((value, index) =>
        value === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-[#a0a0a0]" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={value}
            href={hrefFor(value)}
            aria-label={`Page ${value}`}
            aria-current={value === page ? "page" : undefined}
            className={cn(circle, value === page && "border-primary bg-primary")}
          >
            {value}
          </Link>
        ),
      )}
      {page < pageCount && (
        <Link href={hrefFor(page + 1)} rel="next" className={circle} aria-label="Older">
          <RiArrowRightLine className="size-5" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}

import { ArrowLeft, ArrowRight } from "lucide-react";
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

export function Pagination({ page, pageCount, hrefFor }: Props) {
  if (pageCount <= 1) return null;
  const linkClass = "inline-flex h-10 min-w-10 items-center justify-center rounded-sm px-3 text-sm transition-colors";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-line pt-8">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(linkClass, "gap-2 text-ink hover:bg-paper-sunk")}>
          <ArrowLeft className="size-4" aria-hidden="true" /> Newer
        </Link>
      ) : (
        <span />
      )}
      <ul className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, pageCount).map((value, index) =>
          value === "gap" ? (
            <li key={`gap-${index}`} className="px-2 text-faint" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={value}>
              <Link
                href={hrefFor(value)}
                aria-label={`Page ${value}`}
                aria-current={value === page ? "page" : undefined}
                className={cn(linkClass, value === page ? "bg-ink text-paper" : "text-muted hover:bg-paper-sunk hover:text-ink")}
              >
                {value}
              </Link>
            </li>
          ),
        )}
      </ul>
      <p className="text-sm text-muted sm:hidden">
        Page {page} of {pageCount}
      </p>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(linkClass, "gap-2 text-ink hover:bg-paper-sunk")}>
          Older <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

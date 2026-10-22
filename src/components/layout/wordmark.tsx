import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Wordmark({ className, name = "Elzayko" }: { className?: string; name?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${name}, home`}
      className={cn("font-display text-[1.65rem] leading-none tracking-[-0.01em] text-ink italic", className)}
    >
      {name}
      <span className="text-rosewood not-italic group-data-[overlay=true]/header:text-paper" aria-hidden="true">
        .
      </span>
    </Link>
  );
}

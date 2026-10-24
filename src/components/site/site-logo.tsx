import { RiCameraLensFill, RiSparkling2Fill } from "@remixicon/react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Wordmark in the theme's logo style: a solid pink glyph with a small sparkle,
 * tucked tight against a heavy lowercase name. Pure markup (usable from Client Components).
 */
export function SiteLogo({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${name}, home`}
      className={cn("inline-flex h-[37px] flex-none items-end gap-[3px] leading-none text-white", className)}
    >
      <span className="relative h-[34px] w-[30px] flex-none" aria-hidden="true">
        <RiCameraLensFill className="absolute bottom-0 left-0 size-[28px] text-primary" />
        <RiSparkling2Fill className="absolute top-0 right-0 size-[13px] text-white" />
      </span>
      <span className="pb-[1px] text-[30px] leading-[0.9] font-bold tracking-[-0.045em] lowercase">{name}</span>
    </Link>
  );
}

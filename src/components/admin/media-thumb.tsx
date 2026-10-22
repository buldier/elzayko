import { Film, ImageIcon, Link2 } from "lucide-react";
import Image from "next/image";
import type { MediaType } from "@/features/media/types";
import { derivativeUrl } from "@/lib/storage";
import { cn } from "@/lib/utils/cn";

const ICONS = { IMAGE: ImageIcon, VIDEO: Film, LINK: Link2 } as const;

/** Square admin thumbnail with a type icon fallback. */
export function MediaThumb({
  thumbnailKey,
  thumbnailUrl,
  mediaType,
  size = 48,
  className,
}: {
  thumbnailKey: string | null;
  thumbnailUrl: string | null;
  mediaType: MediaType;
  size?: number;
  className?: string;
}) {
  const src = derivativeUrl(thumbnailKey) ?? thumbnailUrl;
  const Icon = ICONS[mediaType];
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-sunk text-muted", className)} style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" fill sizes={`${size * 2}px`} className="object-cover" /> : <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />}
      {src && mediaType !== "IMAGE" && (
        <span className="absolute right-0.5 bottom-0.5 inline-flex size-4 items-center justify-center rounded-xs bg-ink/75 text-paper">
          <Icon className="size-2.5" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}

import Image from "next/image";
import type { MediaImage as MediaImageData } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  image: MediaImageData;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** "natural" keeps the aspect ratio; "fill" covers the parent box. */
  mode?: "natural" | "fill";
  className?: string;
  quality?: 70 | 80;
};

export function MediaImage({ image, alt, sizes, priority, mode = "natural", className, quality = 80 }: Props) {
  const placeholder = image.blurDataUrl ? ("blur" as const) : ("empty" as const);
  if (mode === "fill") {
    return (
      <Image
        src={image.src}
        alt={alt}
        fill
        sizes={sizes}
        preload={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={image.blurDataUrl ?? undefined}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <Image
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      preload={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={image.blurDataUrl ?? undefined}
      className={cn("h-auto w-full", className)}
    />
  );
}

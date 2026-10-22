import "server-only";
import sharp from "sharp";
import { IMAGE_DERIVATIVES, MEDIA_LIMITS } from "@/config/media";

export type ProcessedImage = {
  width: number;
  height: number;
  display: Buffer;
  thumb: Buffer;
  blurDataUrl: string;
};

/**
 * Decodes an image (rejecting anything sharp cannot parse), applies EXIF orientation,
 * strips all metadata (GPS, camera serials) and renders WebP derivatives.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const base = sharp(input, { limitInputPixels: MEDIA_LIMITS.image.maxPixels, failOn: "error" }).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) throw new Error("Image has no dimensions");
  // EXIF orientations 5–8 rotate by 90°, swapping the displayed width and height.
  const rotated = (meta.orientation ?? 1) >= 5;
  const info = rotated ? { width: meta.height, height: meta.width } : { width: meta.width, height: meta.height };

  const [display, thumb, blur] = await Promise.all([
    base
      .clone()
      .resize({ width: IMAGE_DERIVATIVES.display.width, withoutEnlargement: true })
      .webp({ quality: IMAGE_DERIVATIVES.display.quality })
      .toBuffer(),
    base
      .clone()
      .resize({ width: IMAGE_DERIVATIVES.thumb.width, withoutEnlargement: true })
      .webp({ quality: IMAGE_DERIVATIVES.thumb.quality })
      .toBuffer(),
    base.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer(),
  ]);

  return {
    width: info.width,
    height: info.height,
    display,
    thumb,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

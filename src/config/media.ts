/** Upload policy. The server re-checks every value; the client copy is only for early feedback. */
export const MEDIA_LIMITS = {
  image: {
    maxBytes: 25 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"] as const,
    extensions: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" },
    maxPixels: 120_000_000,
  },
  video: {
    maxBytes: 500 * 1024 * 1024,
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"] as const,
    extensions: { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" },
  },
} as const;

export type UploadKind = keyof typeof MEDIA_LIMITS;
export type AllowedImageMime = (typeof MEDIA_LIMITS.image.mimeTypes)[number];
export type AllowedVideoMime = (typeof MEDIA_LIMITS.video.mimeTypes)[number];
export type AllowedMime = AllowedImageMime | AllowedVideoMime;

export const IMAGE_DERIVATIVES = {
  display: { width: 2400, quality: 82 },
  thumb: { width: 900, quality: 78 },
} as const;

export const GALLERY_PAGE_SIZE = 18;
export const ADMIN_PAGE_SIZE = 20;

export function isAllowedMime(kind: UploadKind, mime: string): mime is AllowedMime {
  return (MEDIA_LIMITS[kind].mimeTypes as readonly string[]).includes(mime);
}

export function extensionFor(kind: UploadKind, mime: AllowedMime): string {
  const map = MEDIA_LIMITS[kind].extensions as Record<string, string>;
  const ext = map[mime];
  if (!ext) throw new Error(`Unsupported ${kind} type: ${mime}`);
  return ext;
}

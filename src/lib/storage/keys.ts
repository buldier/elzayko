import { randomUUID } from "node:crypto";

/** Private originals: uploads/<yyyy>/<mm>/<uuid>.<ext> */
export const UPLOAD_KEY_PATTERN = /^uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp|avif|mp4|webm|mov)$/;
/** Public derivatives: derivatives/<uuid>/<variant>.webp */
export const DERIVATIVE_KEY_PATTERN = /^derivatives\/[0-9a-f-]{36}\/(display|thumb|poster|poster-thumb)\.webp$/;

export function newUploadKey(extension: string, now = new Date()): string {
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `uploads/${yyyy}/${mm}/${randomUUID()}.${extension}`;
}

export function newDerivativePrefix(): string {
  return `derivatives/${randomUUID()}`;
}

export function isUploadKey(key: string): boolean {
  return UPLOAD_KEY_PATTERN.test(key);
}

export function isDerivativeKey(key: string): boolean {
  return DERIVATIVE_KEY_PATTERN.test(key);
}

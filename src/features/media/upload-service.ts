import "server-only";
import { MEDIA_LIMITS, extensionFor, type AllowedMime, type UploadKind } from "@/config/media";
import type { AdminUser } from "@/lib/auth/session";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getStorage } from "@/lib/storage";
import { isUploadKey, newDerivativePrefix, newUploadKey } from "@/lib/storage/keys";
import type { UploadTarget } from "@/lib/storage/types";
import { AppError } from "@/lib/utils/result";
import { mimeFromUploadKey, SNIFF_BYTES, verifyFileSignature } from "./file-signature";
import { processImage } from "./image-processing";
import { uploadRequestSchema } from "./schemas";

export type UploadTicket = { key: string; upload: UploadTarget };

/** Step 1: authorize and mint a direct-to-storage upload target. */
export async function createUploadTicket(admin: AdminUser, raw: unknown): Promise<UploadTicket> {
  const parsed = uploadRequestSchema.safeParse(raw);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Invalid upload request");

  const limit = await rateLimit(`upload:${admin.id}`, RATE_LIMITS.upload);
  if (!limit.allowed) throw new AppError("Upload limit reached. Try again later.", "RATE_LIMITED");

  const { kind, contentType, size } = parsed.data;
  const key = newUploadKey(extensionFor(kind, contentType as AllowedMime));
  const upload = await getStorage().createUploadTarget({ key, contentType, size });
  return { key, upload };
}

export type InspectedUpload = { key: string; kind: UploadKind; mime: string; size: number };

/**
 * Step 2 (server-side, after the browser upload): confirm the object exists, is within limits
 * and that its magic bytes match an allowed type. Rejected objects are deleted.
 */
export async function inspectUpload(key: string, expectedKind?: UploadKind): Promise<InspectedUpload> {
  const storage = getStorage();
  const declared = isUploadKey(key) ? mimeFromUploadKey(key) : null;
  if (!declared) throw new AppError("Invalid upload reference");
  if (expectedKind && declared.kind !== expectedKind) throw new AppError(`Expected an ${expectedKind} file`);

  const head = await storage.head(key);
  if (!head) throw new AppError("The uploaded file could not be found. Please upload it again.");

  const reject = async (message: string): Promise<never> => {
    await storage.delete([key]).catch(() => undefined);
    throw new AppError(message);
  };

  if (head.size === 0) return reject("The uploaded file is empty");
  if (head.size > MEDIA_LIMITS[declared.kind].maxBytes) return reject("The uploaded file is too large");

  const bytes = await storage.readRange(key, 0, Math.min(SNIFF_BYTES, head.size) - 1);
  const signature = await verifyFileSignature(declared.kind, bytes, declared.mime);
  if (!signature.ok) return reject(signature.reason);

  return { key, kind: declared.kind, mime: signature.mime, size: head.size };
}

export type ProcessedUpload = InspectedUpload & {
  width: number;
  height: number;
  displayKey: string;
  thumbnailKey: string;
  blurDataUrl: string;
};

/** Decodes an uploaded image, strips metadata and stores public WebP derivatives. */
export async function processImageUpload(key: string): Promise<ProcessedUpload> {
  const inspected = await inspectUpload(key, "image");
  const storage = getStorage();
  let processed;
  try {
    processed = await processImage(await storage.read(key));
  } catch {
    await storage.delete([key]).catch(() => undefined);
    throw new AppError("The image could not be decoded. It may be corrupt or too large.");
  }
  const prefix = newDerivativePrefix();
  const displayKey = `${prefix}/display.webp`;
  const thumbnailKey = `${prefix}/thumb.webp`;
  await Promise.all([
    storage.put(displayKey, processed.display, "image/webp"),
    storage.put(thumbnailKey, processed.thumb, "image/webp"),
  ]);
  return {
    ...inspected,
    width: processed.width,
    height: processed.height,
    displayKey,
    thumbnailKey,
    blurDataUrl: processed.blurDataUrl,
  };
}

/** Best-effort removal of stored objects (used for cleanup after failures and deletes). */
export async function deleteStoredObjects(keys: (string | null | undefined)[]): Promise<void> {
  const present = keys.filter((key): key is string => Boolean(key));
  if (present.length === 0) return;
  try {
    await getStorage().delete(present);
  } catch (error) {
    console.error("[storage] failed to delete objects", present, error);
  }
}

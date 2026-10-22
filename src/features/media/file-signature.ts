import { fileTypeFromBuffer } from "file-type";
import { MEDIA_LIMITS, type UploadKind } from "@/config/media";

/** Bytes needed by file-type to identify every supported container. */
export const SNIFF_BYTES = 4100;

export type SignatureCheck =
  | { ok: true; mime: string; ext: string }
  | { ok: false; reason: string };

/**
 * Verifies the real file type from its magic bytes instead of trusting the declared MIME type.
 * The detected type must be allowed for the upload kind and match the type declared at upload time.
 */
export async function verifyFileSignature(
  kind: UploadKind,
  head: Uint8Array,
  declaredMime?: string,
): Promise<SignatureCheck> {
  const detected = await fileTypeFromBuffer(head);
  if (!detected) return { ok: false, reason: "Could not identify the file type" };

  const allowed = MEDIA_LIMITS[kind].mimeTypes as readonly string[];
  if (!allowed.includes(detected.mime)) {
    return { ok: false, reason: `Files of type ${detected.mime} are not allowed for ${kind}s` };
  }
  if (declaredMime && declaredMime !== detected.mime) {
    return { ok: false, reason: `File content (${detected.mime}) does not match its declared type (${declaredMime})` };
  }
  return { ok: true, mime: detected.mime, ext: detected.ext };
}

/** Maps an upload key's extension back to the MIME type it was minted for. */
export function mimeFromUploadKey(key: string): { kind: UploadKind; mime: string } | null {
  const ext = key.split(".").pop();
  for (const kind of ["image", "video"] as const) {
    const entry = Object.entries(MEDIA_LIMITS[kind].extensions).find(([, value]) => value === ext);
    if (entry) return { kind, mime: entry[0] };
  }
  return null;
}

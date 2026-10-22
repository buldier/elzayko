import { getAdmin } from "@/lib/auth/session";
import { getStorage } from "@/lib/storage";
import { LocalStorage } from "@/lib/storage/local";
import { verifyUploadToken } from "@/lib/storage/upload-token";
import { isSameOrigin, json, unauthorized } from "@/lib/utils/http";

/**
 * Upload target for the local storage driver (mirrors an S3 presigned PUT).
 * Requires both an admin session and a short-lived token bound to key, type and size.
 * File content is verified later (magic bytes + decode) when the media item is created.
 */
export async function PUT(request: Request) {
  const storage = getStorage();
  if (!(storage instanceof LocalStorage)) return json({ error: "Not found" }, { status: 404 });
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, { status: 403 });
  if (!(await getAdmin())) return unauthorized();

  const token = new URL(request.url).searchParams.get("token") ?? "";
  const claims = verifyUploadToken(token);
  if (!claims) return json({ error: "Upload link is invalid or has expired" }, { status: 403 });

  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim();
  if (contentType !== claims.contentType) return json({ error: "Content type does not match" }, { status: 400 });
  const declaredLength = Number(request.headers.get("content-length") ?? claims.size);
  if (declaredLength !== claims.size) return json({ error: "File size does not match" }, { status: 400 });
  if (!request.body) return json({ error: "Empty upload" }, { status: 400 });

  try {
    const written = await storage.writeStream(claims.key, request.body, claims.size);
    if (written !== claims.size) {
      await storage.delete([claims.key]);
      return json({ error: "Upload was incomplete" }, { status: 400 });
    }
    return json({ key: claims.key, size: written }, { status: 201 });
  } catch (error) {
    const exists = error instanceof Error && "code" in error && error.code === "EEXIST";
    return json({ error: exists ? "This upload link was already used" : "Upload failed" }, { status: exists ? 409 : 400 });
  }
}

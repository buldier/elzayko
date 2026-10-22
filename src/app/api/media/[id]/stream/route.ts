import { mediaRepository } from "@/features/media/repository";
import { getAdmin } from "@/lib/auth/session";
import { getStorage } from "@/lib/storage";
import { notFound } from "@/lib/utils/http";

/** Streams uploaded video (Range-aware locally; short-lived signed redirect on S3). */
export async function GET(request: Request, { params }: RouteContext<"/api/media/[id]/stream">) {
  const { id } = await params;
  if (!/^[a-z0-9]{1,40}$/i.test(id)) return notFound();

  // Admins may preview drafts; visitors only see published videos.
  const isAdmin = Boolean(await getAdmin());
  const media = await mediaRepository.findStreamable(id, isAdmin);
  if (!media?.storageKey || !media.mimeType) return notFound();

  return getStorage().serve(media.storageKey, {
    contentType: media.mimeType,
    range: request.headers.get("range"),
    expiresInSeconds: 60 * 60,
  });
}

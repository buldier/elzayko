import { mediaRepository } from "@/features/media/repository";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getStorage } from "@/lib/storage";
import { notFound, json } from "@/lib/utils/http";
import { getClientIp, hashIp } from "@/lib/utils/request";

/**
 * Controlled image download. Only PUBLISHED + uploaded + IMAGE + allowDownload items are served;
 * anything else is indistinguishable from a missing item (404).
 */
export async function GET(request: Request, { params }: RouteContext<"/api/media/[id]/download">) {
  const { id } = await params;
  if (!/^[a-z0-9]{1,40}$/i.test(id)) return notFound();

  const media = await mediaRepository.findDownloadable(id);
  if (!media?.storageKey || !media.mimeType) return notFound();

  const limit = await rateLimit(`download:${hashIp(getClientIp(request.headers))}`, RATE_LIMITS.download);
  if (!limit.allowed) return json({ error: "Too many downloads. Please try again later." }, { status: 429 });

  const extension = media.storageKey.split(".").pop() ?? "jpg";
  return getStorage().serve(media.storageKey, {
    contentType: media.mimeType,
    downloadFilename: `elzayko-${media.slug}.${extension}`,
    expiresInSeconds: 60,
  });
}

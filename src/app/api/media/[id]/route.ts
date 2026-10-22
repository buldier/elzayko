import { revalidateTag } from "next/cache";
import { toDetail } from "@/features/media/mappers";
import { publicDetailSelect } from "@/features/media/repository";
import type { UpdateMediaInput } from "@/features/media/schemas";
import { deleteMedia, updateMedia } from "@/features/media/service";
import { getAdmin } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/db/prisma";
import { isSameOrigin, json, jsonError, notFound, unauthorized } from "@/lib/utils/http";

const ID = /^[a-z0-9]{1,40}$/i;

/** Public: a single published item. */
export async function GET(_request: Request, { params }: RouteContext<"/api/media/[id]">) {
  const { id } = await params;
  if (!ID.test(id)) return notFound();
  const row = await prisma.media.findFirst({ where: { id, status: "PUBLISHED" }, select: publicDetailSelect });
  return row ? Response.json(toDetail(row)) : notFound();
}

/** Admin: update metadata (same validation as the dashboard form). */
export async function PATCH(request: Request, { params }: RouteContext<"/api/media/[id]">) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, { status: 403 });
  const admin = await getAdmin();
  if (!admin) return unauthorized();
  const { id } = await params;
  try {
    const body = (await request.json().catch(() => ({}))) as Omit<UpdateMediaInput, "id">;
    const media = await updateMedia(admin, { ...body, id });
    revalidateTag(CACHE_TAGS.media, "max");
    return json(media);
  } catch (error) {
    return jsonError(error);
  }
}

/** Admin: delete an item and its stored files. */
export async function DELETE(request: Request, { params }: RouteContext<"/api/media/[id]">) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, { status: 403 });
  const admin = await getAdmin();
  if (!admin) return unauthorized();
  const { id } = await params;
  try {
    await deleteMedia(admin, id);
    revalidateTag(CACHE_TAGS.media, "max");
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonError(error);
  }
}

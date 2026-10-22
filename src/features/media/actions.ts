"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ok, toActionError, type ActionResult } from "@/lib/utils/result";
import { mediaStatusSchema, type CreateMediaInput, type UpdateMediaInput } from "./schemas";
import { createMedia, deleteMedia, setMediaFeatured, setMediaStatus, updateMedia } from "./service";

const idSchema = z.string().min(1).max(40);

export async function createMediaAction(input: CreateMediaInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const admin = await requireAdmin();
  try {
    const media = await createMedia(admin, input);
    updateTag(CACHE_TAGS.media);
    return ok({ id: media.id, slug: media.slug }, "Media created");
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateMediaAction(input: UpdateMediaInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const admin = await requireAdmin();
  try {
    const media = await updateMedia(admin, input);
    updateTag(CACHE_TAGS.media);
    return ok({ id: media.id, slug: media.slug }, "Changes saved");
  } catch (error) {
    return toActionError(error);
  }
}

export async function setMediaStatusAction(id: string, status: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await setMediaStatus(admin, idSchema.parse(id), mediaStatusSchema.parse(status));
    updateTag(CACHE_TAGS.media);
    return ok(undefined, "Status updated");
  } catch (error) {
    return toActionError(error);
  }
}

export async function setMediaFeaturedAction(id: string, featured: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await setMediaFeatured(admin, idSchema.parse(id), z.boolean().parse(featured));
    updateTag(CACHE_TAGS.media);
    return ok(undefined, featured ? "Marked as featured" : "Removed from featured");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await deleteMedia(admin, idSchema.parse(id));
    updateTag(CACHE_TAGS.media);
    updateTag(CACHE_TAGS.taxonomy);
    return ok(undefined, "Media deleted");
  } catch (error) {
    return toActionError(error);
  }
}

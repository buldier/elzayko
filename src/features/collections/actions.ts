"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ok, toActionError, type ActionResult } from "@/lib/utils/result";
import type { CollectionInput } from "./schemas";
import { deleteCollection, saveCollection } from "./service";

export async function saveCollectionAction(input: CollectionInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  try {
    const collection = await saveCollection(input);
    updateTag(CACHE_TAGS.taxonomy);
    return ok({ id: collection.id }, input.id ? "Collection updated" : "Collection created");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteCollection(String(id));
    updateTag(CACHE_TAGS.taxonomy);
    updateTag(CACHE_TAGS.media);
    return ok(undefined, "Collection deleted");
  } catch (error) {
    return toActionError(error);
  }
}

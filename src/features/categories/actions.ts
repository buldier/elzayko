"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ok, toActionError, type ActionResult } from "@/lib/utils/result";
import type { CategoryInput } from "./schemas";
import { deleteCategory, saveCategory } from "./service";

export async function saveCategoryAction(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  try {
    const category = await saveCategory(input);
    updateTag(CACHE_TAGS.taxonomy);
    return ok({ id: category.id }, input.id ? "Category updated" : "Category created");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteCategory(String(id));
    updateTag(CACHE_TAGS.taxonomy);
    updateTag(CACHE_TAGS.media);
    return ok(undefined, "Category deleted");
  } catch (error) {
    return toActionError(error);
  }
}

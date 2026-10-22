"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { fail, ok, toActionError, type ActionResult } from "@/lib/utils/result";
import { isPageSlug } from "./schemas";
import { savePage } from "./service";

export async function savePageAction(slug: string, title: string, content: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isPageSlug(slug)) return fail("Unknown page");
  try {
    await savePage(slug, String(title ?? ""), content);
    updateTag(CACHE_TAGS.pages);
    return ok(undefined, "Page saved");
  } catch (error) {
    return toActionError(error);
  }
}

"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ok, toActionError, type ActionResult } from "@/lib/utils/result";
import type { SiteSettingsInput } from "./schemas";
import { saveSiteSettings } from "./service";

export async function saveSettingsAction(input: SiteSettingsInput): Promise<ActionResult> {
  await requireAdmin();
  try {
    await saveSiteSettings(input);
    updateTag(CACHE_TAGS.settings);
    return ok(undefined, "Settings saved");
  } catch (error) {
    return toActionError(error);
  }
}

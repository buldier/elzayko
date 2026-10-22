import { createUploadTicket } from "@/features/media/upload-service";
import { getAdmin } from "@/lib/auth/session";
import { isSameOrigin, json, jsonError, unauthorized } from "@/lib/utils/http";

/** Issues a direct-to-storage upload target for an authenticated administrator. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, { status: 403 });
  const admin = await getAdmin();
  if (!admin) return unauthorized();
  try {
    const body = await request.json().catch(() => null);
    return json(await createUploadTicket(admin, body), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

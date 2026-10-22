import { submitContact } from "@/features/contact/service";
import { isSameOrigin, json, jsonError } from "@/lib/utils/http";
import { getClientIp } from "@/lib/utils/request";

/** JSON alternative to the contact form's Server Action (same validation and protections). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await request.json().catch(() => null);
    await submitContact(body, { ip: getClientIp(request.headers), userAgent: request.headers.get("user-agent") });
    return json({ ok: true }, { status: 202 });
  } catch (error) {
    return jsonError(error);
  }
}

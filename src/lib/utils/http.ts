import "server-only";
import { AppError } from "./result";

const NO_STORE = { "Cache-Control": "private, no-store" };

export function jsonError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json({ error: error.message, fieldErrors: error.fieldErrors }, { status: error.status, headers: NO_STORE });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500, headers: NO_STORE });
}

export function notFound(): Response {
  return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
}

export function unauthorized(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
}

export function json<T>(data: T, init: ResponseInit = {}): Response {
  return Response.json(data, { ...init, headers: { ...NO_STORE, ...init.headers } });
}

/** Rejects cross-site state-changing requests (defence in depth on top of SameSite cookies). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).host === new URL(request.url).host || origin === process.env.SITE_URL;
  } catch {
    return false;
  }
}

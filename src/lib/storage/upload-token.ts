import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** Short-lived HMAC token binding a local upload to one key, type and size. */
export type UploadClaims = { key: string; contentType: string; size: number; exp: number };

function sign(payload: string): string {
  return createHmac("sha256", `upload:${env().BETTER_AUTH_SECRET}`).update(payload).digest("base64url");
}

export function createUploadToken(claims: UploadClaims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyUploadToken(token: string, now = Date.now()): UploadClaims | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as UploadClaims;
    if (typeof claims.exp !== "number" || claims.exp < now) return null;
    return claims;
  } catch {
    return null;
  }
}

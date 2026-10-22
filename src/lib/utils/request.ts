import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Best-effort client IP from trusted proxy headers (configure TRUSTED_IP_HEADERS for your host).
 * Only used for rate limiting and hashed spam signals, never for authorization.
 */
export function getClientIp(headers: Headers): string {
  const trusted = env()
    .TRUSTED_IP_HEADERS.split(",")
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean);
  for (const header of trusted) {
    const value = headers.get(header);
    if (value) {
      const first = value.split(",")[0]?.trim();
      if (first) return first.slice(0, 64);
    }
  }
  return "unknown";
}

/** Salted, non-reversible fingerprint so raw IP addresses are never persisted. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${env().BETTER_AUTH_SECRET}:${ip}`).digest("hex");
}

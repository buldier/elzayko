import "server-only";
import { prisma } from "@/lib/db/prisma";

export type RateLimitRule = { limit: number; windowSeconds: number };

export type RateLimitResult = { allowed: boolean; remaining: number; resetAt: Date };

export const RATE_LIMITS = {
  contact: { limit: 5, windowSeconds: 60 * 60 },
  login: { limit: 10, windowSeconds: 15 * 60 },
  upload: { limit: 60, windowSeconds: 60 * 60 },
  download: { limit: 120, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

/**
 * Fixed-window counter stored in Postgres so limits hold across instances.
 * A single atomic upsert increments the window or starts a new one when expired.
 */
export async function rateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const rows = await prisma.$queryRaw<{ count: number; expiresAt: Date }[]>`
    INSERT INTO "rate_limit_buckets" ("key", "count", "expiresAt")
    VALUES (${key}, 1, now() + make_interval(secs => ${rule.windowSeconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "rate_limit_buckets"."expiresAt" <= now() THEN 1 ELSE "rate_limit_buckets"."count" + 1 END,
      "expiresAt" = CASE WHEN "rate_limit_buckets"."expiresAt" <= now()
        THEN now() + make_interval(secs => ${rule.windowSeconds})
        ELSE "rate_limit_buckets"."expiresAt" END
    RETURNING "count", "expiresAt"`;
  const row = rows[0];
  if (!row) throw new Error("Rate limiter returned no row");
  return {
    allowed: row.count <= rule.limit,
    remaining: Math.max(0, rule.limit - row.count),
    resetAt: row.expiresAt,
  };
}

/** Removes expired buckets; safe to call from a cron job. */
export async function pruneRateLimits(): Promise<number> {
  const { count } = await prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return count;
}

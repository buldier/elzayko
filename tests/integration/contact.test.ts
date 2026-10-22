import { describe, expect, it } from "vitest";
import { submitContact } from "@/features/contact/service";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/db/prisma";

const message = { name: "Ada Lovelace", email: "ada@example.com", subject: "Prints", message: "Do you sell prints of the coastal series?" };

describe("contact submissions", () => {
  it("stores valid messages with a hashed IP only", async () => {
    await submitContact(message, { ip: "198.51.100.1", userAgent: "vitest" });
    const row = await prisma.contactSubmission.findFirstOrThrow({ where: { email: "ada@example.com" } });
    expect(row.ipHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(row)).not.toContain("198.51.100.1");
  });

  it("silently drops honeypot and too-fast submissions", async () => {
    const before = await prisma.contactSubmission.count();
    expect(await submitContact({ ...message, website: "http://spam" }, { ip: "198.51.100.2", userAgent: null })).toEqual({ stored: false });
    expect(await submitContact({ ...message, startedAt: 1000 }, { ip: "198.51.100.2", userAgent: null, now: 2000 })).toEqual({ stored: false });
    expect(await prisma.contactSubmission.count()).toBe(before);
  });

  it("returns field errors for invalid input", async () => {
    await expect(submitContact({ ...message, email: "bad" }, { ip: "198.51.100.3", userAgent: null })).rejects.toMatchObject({
      fieldErrors: { email: [expect.any(String)] },
    });
  });

  it("rate-limits repeated messages from one address", async () => {
    const context = { ip: "198.51.100.4", userAgent: null };
    for (let i = 0; i < 5; i++) await submitContact(message, context);
    await expect(submitContact(message, context)).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });
});

describe("rate limiter", () => {
  it("counts within a window and resets after it expires", async () => {
    const rule = { limit: 2, windowSeconds: 1 };
    expect((await rateLimit("t:window", rule)).allowed).toBe(true);
    expect((await rateLimit("t:window", rule)).allowed).toBe(true);
    expect((await rateLimit("t:window", rule)).allowed).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(await rateLimit("t:window", rule)).toMatchObject({ allowed: true, remaining: 1 });
  });
});

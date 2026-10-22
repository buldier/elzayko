import { describe, expect, it } from "vitest";
import { contactSchema } from "@/features/contact/schemas";
import { createMediaSchema, parseGalleryFilters, uploadRequestSchema } from "@/features/media/schemas";
import { aboutContentSchema } from "@/features/pages/schemas";
import { siteSettingsSchema } from "@/features/settings/schemas";

describe("upload requests", () => {
  it("accepts supported types within limits", () => {
    expect(uploadRequestSchema.safeParse({ kind: "image", filename: "a.jpg", contentType: "image/jpeg", size: 1000 }).success).toBe(true);
  });
  it.each([
    [{ kind: "image", filename: "a.svg", contentType: "image/svg+xml", size: 10 }, "Unsupported"],
    [{ kind: "image", filename: "a.gif", contentType: "image/gif", size: 10 }, "Unsupported"],
    [{ kind: "video", filename: "a.mp4", contentType: "video/mp4", size: 600 * 1024 * 1024 }, "larger than"],
    [{ kind: "image", filename: "a.mp4", contentType: "video/mp4", size: 10 }, "Unsupported"],
  ])("rejects %o", (input, message) => {
    const result = uploadRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(message);
  });
});

describe("media input", () => {
  const base = { title: "T", tags: [], collectionIds: [] };
  it("rejects external media that claims to be downloadable", () => {
    expect(createMediaSchema.safeParse({ ...base, source: "external", url: "https://youtu.be/aqz-KE-bpKQ", allowDownload: true }).success).toBe(false);
  });
  it("rejects storage keys outside the upload namespace", () => {
    expect(createMediaSchema.safeParse({ ...base, source: "upload", storageKey: "../../etc/passwd" }).success).toBe(false);
  });
  it("rejects invalid slugs", () => {
    expect(createMediaSchema.safeParse({ ...base, source: "external", url: "https://x.com/a", slug: "Bad Slug!" }).success).toBe(false);
  });
});

describe("gallery filters", () => {
  it("falls back to defaults for invalid values", () => {
    expect(parseGalleryFilters({ type: "exe", page: "-4", q: ["sea", "x"] })).toMatchObject({ type: "all", page: 1, q: "sea" });
  });
});

describe("contact", () => {
  const valid = { name: "Ada", email: "ada@example.com", subject: "Hello", message: "A message long enough." };
  it("accepts a valid message", () => expect(contactSchema.safeParse(valid).success).toBe(true));
  it("fails when the honeypot is filled", () => expect(contactSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false));
  it("requires a real email", () => expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false));
});

describe("settings and pages", () => {
  it("only accepts https social links on known platforms", () => {
    const base = { siteName: "U", tagline: "", description: "", heroHeading: "H", heroIntro: "", contactEmail: "", location: "" };
    expect(siteSettingsSchema.safeParse({ ...base, socialLinks: [{ platform: "instagram", url: "javascript:alert(1)" }] }).success).toBe(false);
    expect(siteSettingsSchema.safeParse({ ...base, socialLinks: [{ platform: "myspace", url: "https://x.com" }] }).success).toBe(false);
    expect(siteSettingsSchema.parse({ ...base, socialLinks: [] }).contactEmail).toBeNull();
  });
  it("validates about content", () => {
    expect(aboutContentSchema.safeParse({ heading: "" }).success).toBe(false);
  });
});

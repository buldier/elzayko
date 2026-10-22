import { existsSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { getGalleryPage } from "@/features/media/queries";
import { mediaRepository } from "@/features/media/repository";
import { parseGalleryFilters } from "@/features/media/schemas";
import { createMedia, deleteMedia, setMediaStatus, updateMedia } from "@/features/media/service";
import type { AdminUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/utils/result";
import { createUser, jpegBuffer, storeUpload } from "../support/fixtures";

let admin: AdminUser;
const stored = (key: string) => existsSync(path.join(process.env.LOCAL_STORAGE_DIR!, key));
const base = { tags: [], collectionIds: [] };

beforeAll(async () => {
  const user = await createUser("admin");
  admin = { id: user.id, name: user.name, email: user.email };
});

describe("uploaded images", () => {
  it("verifies, processes and stores derivatives", async () => {
    const key = await storeUpload(await jpegBuffer(800, 600));
    const created = await createMedia(admin, {
      ...base, source: "upload", storageKey: key, title: "Harbour", altText: "A harbour", status: "PUBLISHED", allowDownload: true, tags: ["Sea", "sea", "Light"],
    });
    const media = await prisma.media.findUniqueOrThrow({ where: { id: created.id }, include: { tags: true } });
    expect(media).toMatchObject({ slug: "harbour", mediaType: "IMAGE", width: 800, height: 600, mimeType: "image/jpeg", allowDownload: true });
    expect(media.publishedAt).toBeInstanceOf(Date);
    expect(media.tags).toHaveLength(2);
    expect(stored(media.displayKey!) && stored(media.thumbnailKey!)).toBe(true);
    expect(media.blurDataUrl).toMatch(/^data:image\/webp;base64,/);
  });

  it("rejects a file whose content is not an image and deletes it", async () => {
    const key = await storeUpload(Buffer.from("#!/bin/sh\nrm -rf /\n".repeat(20)));
    await expect(createMedia(admin, { ...base, source: "upload", storageKey: key, title: "Fake" })).rejects.toThrow(/identify the file type/);
    expect(stored(key)).toBe(false);
  });

  it("rejects a PNG uploaded under a JPEG key", async () => {
    const sharp = (await import("sharp")).default;
    const png = await sharp({ create: { width: 10, height: 10, channels: 3, background: "#000" } }).png().toBuffer();
    const key = await storeUpload(png, "jpg");
    await expect(createMedia(admin, { ...base, source: "upload", storageKey: key, title: "Mismatch" })).rejects.toThrow(/does not match/);
  });

  it("refuses to attach the same upload twice", async () => {
    const key = await storeUpload(await jpegBuffer());
    await createMedia(admin, { ...base, source: "upload", storageKey: key, title: "Once" });
    await expect(createMedia(admin, { ...base, source: "upload", storageKey: key, title: "Twice" })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("requires alt text before an image is published", async () => {
    const key = await storeUpload(await jpegBuffer());
    await expect(createMedia(admin, { ...base, source: "upload", storageKey: key, title: "No alt", status: "PUBLISHED" })).rejects.toThrow(/alt text/i);
    const draft = await createMedia(admin, { ...base, source: "upload", storageKey: key, title: "No alt" });
    await expect(setMediaStatus(admin, draft.id, "PUBLISHED")).rejects.toThrow(/alt text/i);
  });

  it("deletes stored files with the row", async () => {
    const key = await storeUpload(await jpegBuffer());
    const { id } = await createMedia(admin, { ...base, source: "upload", storageKey: key, title: "Temporary" });
    const media = await prisma.media.findUniqueOrThrow({ where: { id } });
    await deleteMedia(admin, id);
    expect(await prisma.media.findUnique({ where: { id } })).toBeNull();
    expect([key, media.displayKey!, media.thumbnailKey!].some(stored)).toBe(false);
  });
});

describe("external media", () => {
  it("stores YouTube videos by provider id", async () => {
    const { id } = await createMedia(admin, { ...base, source: "external", url: "https://youtu.be/aqz-KE-bpKQ", title: "Film", status: "PUBLISHED" });
    expect(await prisma.media.findUnique({ where: { id } })).toMatchObject({
      mediaType: "VIDEO", sourceType: "EXTERNAL", provider: "youtube", externalId: "aqz-KE-bpKQ", allowDownload: false, storageKey: null,
    });
  });

  it("never enables downloads for external items, even through update", async () => {
    const { id } = await createMedia(admin, { ...base, source: "external", url: "https://www.behance.net/gallery/1", title: "Link" });
    await updateMedia(admin, { ...base, id, title: "Link", allowDownload: true });
    expect((await prisma.media.findUniqueOrThrow({ where: { id } })).allowDownload).toBe(false);
  });

  it("rejects unsafe URLs", async () => {
    await expect(createMedia(admin, { ...base, source: "external", url: "javascript:alert(1)", title: "x" })).rejects.toBeInstanceOf(AppError);
  });

  it("enforces unique slugs", async () => {
    await createMedia(admin, { ...base, source: "external", url: "https://x.com/a/status/1", title: "Same", slug: "same-slug" });
    await expect(createMedia(admin, { ...base, source: "external", url: "https://x.com/a/status/2", title: "Same", slug: "same-slug" })).rejects.toMatchObject({ code: "CONFLICT" });
    const auto = await createMedia(admin, { ...base, source: "external", url: "https://x.com/a/status/3", title: "Same slug" });
    expect(auto.slug).toBe("same-slug-2");
  });
});

describe("public visibility", () => {
  it("only exposes published items and download-enabled images", async () => {
    const key = await storeUpload(await jpegBuffer());
    const draft = await createMedia(admin, { ...base, source: "upload", storageKey: key, title: "Secret draft", altText: "x", allowDownload: true });
    const page = await getGalleryPage(parseGalleryFilters({ q: "Secret draft" }));
    expect(page.items).toHaveLength(0);
    expect(await mediaRepository.findDownloadable(draft.id)).toBeNull();

    await setMediaStatus(admin, draft.id, "PUBLISHED");
    expect(await mediaRepository.findDownloadable(draft.id)).not.toBeNull();
    const published = await getGalleryPage(parseGalleryFilters({ q: "secret" }));
    expect(published.items.map((item) => item.id)).toContain(draft.id);
    expect(JSON.stringify(published)).not.toContain(key);

    await setMediaStatus(admin, draft.id, "ARCHIVED");
    expect(await mediaRepository.findDownloadable(draft.id)).toBeNull();
  });

  it("database constraints block downloadable non-images", async () => {
    const { id } = await createMedia(admin, { ...base, source: "external", url: "https://youtu.be/eRsGyueVLvQ", title: "Constraint" });
    await expect(prisma.media.update({ where: { id }, data: { allowDownload: true } })).rejects.toThrow();
  });
});

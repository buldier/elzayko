import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { mimeFromUploadKey, verifyFileSignature } from "@/features/media/file-signature";

const png = () => sharp({ create: { width: 4, height: 4, channels: 3, background: "#fff" } }).png().toBuffer();
const jpeg = () => sharp({ create: { width: 4, height: 4, channels: 3, background: "#fff" } }).jpeg().toBuffer();
/** Minimal MP4 `ftyp` box. */
const mp4 = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from("ftypisom"), Buffer.alloc(4), Buffer.from("isomiso2"), Buffer.alloc(16)]);

describe("verifyFileSignature", () => {
  it("accepts a real JPEG declared as JPEG", async () => {
    expect(await verifyFileSignature("image", await jpeg(), "image/jpeg")).toMatchObject({ ok: true, mime: "image/jpeg" });
  });

  it("rejects a PNG declared as JPEG (content/type mismatch)", async () => {
    const result = await verifyFileSignature("image", await png(), "image/jpeg");
    expect(result.ok).toBe(false);
  });

  it("rejects text renamed to .jpg", async () => {
    const result = await verifyFileSignature("image", Buffer.from("<?php echo 'hi'; ?>"), "image/jpeg");
    expect(result).toEqual({ ok: false, reason: "Could not identify the file type" });
  });

  it("rejects an executable even when declared as an image", async () => {
    const elf = Buffer.concat([Buffer.from([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1]), Buffer.alloc(64)]);
    expect((await verifyFileSignature("image", elf, "image/png")).ok).toBe(false);
  });

  it("rejects an image uploaded through the video path", async () => {
    expect((await verifyFileSignature("video", await jpeg())).ok).toBe(false);
  });

  it("accepts an MP4 container for videos", async () => {
    expect(await verifyFileSignature("video", mp4, "video/mp4")).toMatchObject({ ok: true, mime: "video/mp4" });
  });
});

describe("mimeFromUploadKey", () => {
  it("maps minted extensions back to their declared type", () => {
    expect(mimeFromUploadKey("uploads/2026/10/x.webp")).toEqual({ kind: "image", mime: "image/webp" });
    expect(mimeFromUploadKey("uploads/2026/10/x.mov")).toEqual({ kind: "video", mime: "video/quicktime" });
    expect(mimeFromUploadKey("uploads/2026/10/x.exe")).toBeNull();
  });
});

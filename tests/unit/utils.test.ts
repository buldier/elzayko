import { describe, expect, it } from "vitest";
import { parseRichText } from "@/components/ui/rich-text";
import { isDerivativeKey, isUploadKey, newUploadKey } from "@/lib/storage/keys";
import { parseRange } from "@/lib/storage/local";
import { formatBytes, formatDuration } from "@/lib/utils/format";
import { isValidSlug, slugify, uniqueSlug } from "@/lib/utils/slug";

describe("slugify", () => {
  it.each([
    ["Low Tide, November", "low-tide-november"],
    ["  Crème brûlée & Café  ", "creme-brulee-and-cafe"],
    ["---", ""],
    ["Ünïcödé — dashes", "unicode-dashes"],
  ])("%s → %s", (input, output) => {
    expect(slugify(input)).toBe(output);
  });

  it("respects max length without trailing hyphens", () => {
    const slug = slugify("a ".repeat(100), 9);
    expect(slug.length).toBeLessThanOrEqual(9);
    expect(isValidSlug(slug)).toBe(true);
  });

  it("finds the next free slug", async () => {
    const taken = new Set(["sea", "sea-2"]);
    expect(await uniqueSlug("Sea", async (candidate) => taken.has(candidate))).toBe("sea-3");
  });
});

describe("storage keys", () => {
  it("mints keys that match the upload pattern", () => {
    expect(isUploadKey(newUploadKey("jpg"))).toBe(true);
  });

  it.each(["uploads/../../.env", "derivatives/x/display.webp", "uploads/2026/10/abc.jpg", "/etc/passwd"])(
    "rejects malformed upload key %s",
    (key) => expect(isUploadKey(key)).toBe(false),
  );

  it("never treats originals as public derivatives", () => {
    expect(isDerivativeKey(newUploadKey("jpg"))).toBe(false);
    expect(isDerivativeKey("derivatives/123e4567-e89b-12d3-a456-426614174000/display.webp")).toBe(true);
  });
});

describe("parseRange", () => {
  it("parses common byte ranges", () => {
    expect(parseRange("bytes=0-99", 1000)).toEqual({ start: 0, end: 99 });
    expect(parseRange("bytes=900-", 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange("bytes=-100", 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange("bytes=0-5000", 1000)).toEqual({ start: 0, end: 999 });
  });
  it("flags unsatisfiable ranges", () => {
    expect(parseRange("bytes=2000-", 1000)).toBe("invalid");
  });
  it("ignores absent or unsupported headers", () => {
    expect(parseRange(null, 10)).toBeNull();
    expect(parseRange("bytes=0-1,4-5", 10)).toBeNull();
  });
});

describe("rich text", () => {
  it("parses headings, lists and paragraphs without HTML", () => {
    expect(parseRichText("## Title\n\nPara one\nline two\n\n- a\n- b\n\n<script>x</script>")).toEqual([
      { type: "h2", text: "Title" },
      { type: "p", text: "Para one\nline two" },
      { type: "ul", items: ["a", "b"] },
      { type: "p", text: "<script>x</script>" },
    ]);
  });
});

describe("formatting", () => {
  it("formats bytes and durations", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(25 * 1024 * 1024)).toBe("25 MB");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3725)).toBe("1:02:05");
  });
});

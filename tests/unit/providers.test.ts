import { describe, expect, it } from "vitest";
import { embedUrlFor, resolveExternalMedia } from "@/features/media/providers";
import { detectPlatform, sanitizeExternalUrl } from "@/features/media/providers/link";
import { extractYouTubeId } from "@/features/media/providers/youtube";

describe("YouTube provider", () => {
  it.each([
    ["https://www.youtube.com/watch?v=aqz-KE-bpKQ", "aqz-KE-bpKQ"],
    ["https://youtu.be/eRsGyueVLvQ?t=10", "eRsGyueVLvQ"],
    ["https://m.youtube.com/watch?v=aqz-KE-bpKQ&feature=share", "aqz-KE-bpKQ"],
    ["https://www.youtube.com/embed/aqz-KE-bpKQ", "aqz-KE-bpKQ"],
    ["https://www.youtube.com/shorts/aqz-KE-bpKQ", "aqz-KE-bpKQ"],
    ["https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ", "aqz-KE-bpKQ"],
  ])("extracts the id from %s", (url, id) => {
    expect(extractYouTubeId(new URL(url))).toBe(id);
  });

  it.each([
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch?v=aqz-KE-bpKQ<script>",
    "https://youtube.com.evil.example/watch?v=aqz-KE-bpKQ",
    "https://www.youtube.com/channel/UC123",
  ])("rejects %s", (url) => {
    expect(extractYouTubeId(new URL(url))).toBeNull();
  });

  it("builds a privacy-enhanced embed URL from the id only", () => {
    const resolved = resolveExternalMedia("https://youtu.be/aqz-KE-bpKQ");
    expect(resolved).toMatchObject({ provider: "youtube", mediaType: "VIDEO", externalId: "aqz-KE-bpKQ" });
    expect(resolved.embedUrl).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/aqz-KE-bpKQ\?/);
    expect(embedUrlFor("youtube", "bad id")).toBeNull();
  });

  it("reports malformed YouTube links instead of saving them as plain links", () => {
    expect(() => resolveExternalMedia("https://www.youtube.com/watch?v=nope")).toThrow(/valid video id/);
  });
});

describe("generic link provider", () => {
  it("labels known platforms and never embeds them", () => {
    const resolved = resolveExternalMedia("https://www.instagram.com/p/abc123/?utm_source=ig&igsh=xyz");
    expect(resolved).toMatchObject({ provider: "instagram", providerLabel: "Instagram", mediaType: "LINK", embedUrl: null });
    expect(resolved.url).toBe("https://www.instagram.com/p/abc123/");
  });

  it("detects subdomains but not look-alike hosts", () => {
    expect(detectPlatform("vm.tiktok.com").id).toBe("tiktok");
    expect(detectPlatform("nottiktok.com").id).toBe("link");
  });

  it("strips credentials and fragments", () => {
    expect(sanitizeExternalUrl(new URL("https://user:pass@example.com/a?b=1#frag"))).toBe("https://example.com/a?b=1");
  });

  it.each(["javascript:alert(1)", "ftp://example.com/file", "https://127.0.0.1/admin", "https://localhost/", "not a url"])(
    "rejects unsafe or unusable URL %s",
    (url) => {
      expect(() => resolveExternalMedia(url)).toThrow();
    },
  );

  it("upgrades http to https", () => {
    expect(resolveExternalMedia("http://example.com/post").url).toBe("https://example.com/post");
  });
});

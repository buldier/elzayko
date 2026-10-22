import type { ExternalMediaProvider, ResolvedExternalMedia } from "./types";

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com"]);

/** Extracts an 11-character YouTube video id from the URL shapes YouTube publishes. */
export function extractYouTubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;

  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = url.pathname.split("/")[1] ?? null;
  } else if (url.pathname === "/watch") {
    candidate = url.searchParams.get("v");
  } else {
    const match = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname);
    candidate = match?.[1] ?? null;
  }
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

export const youtubeProvider: ExternalMediaProvider = {
  id: "youtube",
  label: "YouTube",
  resolve(url): ResolvedExternalMedia | null {
    const id = extractYouTubeId(url);
    if (!id) return null;
    return {
      provider: "youtube",
      providerLabel: "YouTube",
      mediaType: "VIDEO",
      url: `https://www.youtube.com/watch?v=${id}`,
      externalId: id,
      embedUrl: this.embedUrlFor(id),
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  },
  embedUrlFor(id) {
    if (!VIDEO_ID.test(id)) return null;
    // Privacy-enhanced mode: no tracking cookies until playback.
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  },
};

import { detectPlatform, linkProvider } from "./link";
import type { ExternalMediaProvider, ResolvedExternalMedia } from "./types";
import { youtubeProvider } from "./youtube";

/** Embeddable providers, tried in order. The generic link provider is the fallback. */
const EMBED_PROVIDERS: ExternalMediaProvider[] = [youtubeProvider];

export class ExternalUrlError extends Error {}

export function parseExternalUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new ExternalUrlError("Enter a valid URL, including https://");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ExternalUrlError("Only http(s) links are supported");
  }
  if (!url.hostname.includes(".") || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) || url.hostname.startsWith("[")) {
    throw new ExternalUrlError("Links must point to a public domain name");
  }
  if (url.protocol === "http:") url.protocol = "https:";
  return url;
}

/** Resolves a pasted URL to a provider. Throws ExternalUrlError for unusable input. */
export function resolveExternalMedia(raw: string): ResolvedExternalMedia {
  const url = parseExternalUrl(raw);
  for (const provider of EMBED_PROVIDERS) {
    const resolved = provider.resolve(url);
    if (resolved) return resolved;
  }
  if (detectPlatform(url.hostname).id === "link" && /youtu/.test(url.hostname)) {
    throw new ExternalUrlError("That YouTube URL does not contain a valid video id");
  }
  return linkProvider.resolve(url)!;
}

export function embedUrlFor(provider: string | null, externalId: string | null): string | null {
  if (!provider || !externalId) return null;
  return EMBED_PROVIDERS.find((candidate) => candidate.id === provider)?.embedUrlFor(externalId) ?? null;
}

export function providerLabel(provider: string | null, url: string | null): string {
  if (provider === "youtube") return "YouTube";
  if (!url) return "Link";
  try {
    return detectPlatform(new URL(url).hostname).label;
  } catch {
    return "Link";
  }
}

export type { ResolvedExternalMedia } from "./types";

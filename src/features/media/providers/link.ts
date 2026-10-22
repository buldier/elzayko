import type { ExternalMediaProvider, ResolvedExternalMedia } from "./types";

/**
 * Platforms recognised for labelling. They are rendered as preview cards with an outbound link:
 * their embeds need platform scripts/API terms that have not been verified for this site.
 */
const PLATFORMS: { id: string; label: string; hosts: string[] }[] = [
  { id: "instagram", label: "Instagram", hosts: ["instagram.com"] },
  { id: "tiktok", label: "TikTok", hosts: ["tiktok.com"] },
  { id: "x", label: "X", hosts: ["x.com", "twitter.com"] },
  { id: "facebook", label: "Facebook", hosts: ["facebook.com", "fb.watch"] },
  { id: "vimeo", label: "Vimeo", hosts: ["vimeo.com"] },
  { id: "behance", label: "Behance", hosts: ["behance.net"] },
  { id: "dribbble", label: "Dribbble", hosts: ["dribbble.com"] },
  { id: "pinterest", label: "Pinterest", hosts: ["pinterest.com"] },
  { id: "linkedin", label: "LinkedIn", hosts: ["linkedin.com"] },
  { id: "flickr", label: "Flickr", hosts: ["flickr.com"] },
  { id: "soundcloud", label: "SoundCloud", hosts: ["soundcloud.com"] },
];

export function detectPlatform(hostname: string): { id: string; label: string } {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  for (const platform of PLATFORMS) {
    if (platform.hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))) {
      return { id: platform.id, label: platform.label };
    }
  }
  return { id: "link", label: host };
}

/** Strips credentials, fragments and common tracking parameters. */
export function sanitizeExternalUrl(url: URL): string {
  const clean = new URL(url.toString());
  clean.username = "";
  clean.password = "";
  clean.hash = "";
  for (const param of [...clean.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$|igsh$|si$)/i.test(param)) clean.searchParams.delete(param);
  }
  return clean.toString();
}

export const linkProvider: ExternalMediaProvider = {
  id: "link",
  label: "External link",
  resolve(url): ResolvedExternalMedia {
    const platform = detectPlatform(url.hostname);
    return {
      provider: platform.id,
      providerLabel: platform.label,
      mediaType: "LINK",
      url: sanitizeExternalUrl(url),
      externalId: null,
      embedUrl: null,
      thumbnailUrl: null,
    };
  },
  embedUrlFor() {
    return null;
  },
};

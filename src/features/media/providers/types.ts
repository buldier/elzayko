export type ResolvedExternalMedia = {
  provider: string;
  providerLabel: string;
  mediaType: "VIDEO" | "LINK";
  /** Canonical, sanitized URL to store and link to. */
  url: string;
  externalId: string | null;
  /** Provider-built iframe URL. Never derived from user-supplied HTML. */
  embedUrl: string | null;
  thumbnailUrl: string | null;
};

export interface ExternalMediaProvider {
  readonly id: string;
  readonly label: string;
  /** Returns null when the URL does not belong to this provider or is malformed. */
  resolve(url: URL): ResolvedExternalMedia | null;
  /** Rebuilds the embed URL from stored data (so stored rows never carry iframe markup). */
  embedUrlFor(externalId: string): string | null;
}

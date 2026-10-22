export type UploadTarget = {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresAt: string;
};

export type ServeOptions = {
  contentType: string;
  /** When set, the response forces a download with this filename. */
  downloadFilename?: string;
  /** Incoming Range header for streaming video. */
  range?: string | null;
  /** Lifetime of signed URLs for providers that redirect. */
  expiresInSeconds?: number;
};

export interface StorageProvider {
  readonly driver: "local" | "s3";
  /** Direct-to-storage upload target for an already-authorized request. */
  createUploadTarget(input: { key: string; contentType: string; size: number }): Promise<UploadTarget>;
  head(key: string): Promise<{ size: number } | null>;
  /** Inclusive byte range, used for magic-byte sniffing without downloading whole files. */
  readRange(key: string, start: number, end: number): Promise<Buffer>;
  read(key: string): Promise<Buffer>;
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  delete(keys: string[]): Promise<void>;
  /** URL for public derivatives (never for originals). */
  publicUrl(key: string): string;
  /** Response that streams or redirects to a private object. Callers must authorize first. */
  serve(key: string, options: ServeOptions): Promise<Response>;
}

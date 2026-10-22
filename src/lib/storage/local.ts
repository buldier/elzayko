import "server-only";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { isDerivativeKey, isUploadKey } from "./keys";
import type { ServeOptions, StorageProvider, UploadTarget } from "./types";
import { createUploadToken } from "./upload-token";

const UPLOAD_TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * Filesystem storage for development and single-node deployments.
 * Originals live outside `public/`; derivatives are served by /files/[...key].
 */
export class LocalStorage implements StorageProvider {
  readonly driver = "local" as const;
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  private resolve(key: string): string {
    if (!isUploadKey(key) && !isDerivativeKey(key)) throw new Error("Invalid storage key");
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error("Invalid storage key");
    return full;
  }

  async createUploadTarget(input: { key: string; contentType: string; size: number }): Promise<UploadTarget> {
    const exp = Date.now() + UPLOAD_TOKEN_TTL_MS;
    const token = createUploadToken({ ...input, exp });
    return {
      url: `/api/uploads/local?token=${encodeURIComponent(token)}`,
      method: "PUT",
      headers: { "Content-Type": input.contentType },
      expiresAt: new Date(exp).toISOString(),
    };
  }

  /** Streams a request body to disk, aborting when it exceeds `maxBytes`. */
  async writeStream(key: string, body: ReadableStream<Uint8Array>, maxBytes: number): Promise<number> {
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });
    let written = 0;
    const limiter = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        written += chunk.length;
        if (written > maxBytes) callback(new Error("Upload exceeds declared size"));
        else callback(null, chunk);
      },
    });
    try {
      await pipeline(Readable.fromWeb(body as import("node:stream/web").ReadableStream), limiter, createWriteStream(target, { flags: "wx" }));
    } catch (error) {
      await rm(target, { force: true });
      throw error;
    }
    return written;
  }

  async head(key: string) {
    try {
      const info = await stat(this.resolve(key));
      return { size: info.size };
    } catch {
      return null;
    }
  }

  async readRange(key: string, start: number, end: number): Promise<Buffer> {
    const handle = await open(this.resolve(key), "r");
    try {
      const length = end - start + 1;
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await handle.read(buffer, 0, length, start);
      return buffer.subarray(0, bytesRead);
    } finally {
      await handle.close();
    }
  }

  read(key: string): Promise<Buffer> {
    return readFile(this.resolve(key));
  }

  async put(key: string, body: Buffer): Promise<void> {
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, body);
  }

  async delete(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => rm(this.resolve(key), { force: true })));
  }

  publicUrl(key: string): string {
    return `/files/${key}`;
  }

  async serve(key: string, options: ServeOptions): Promise<Response> {
    const file = this.resolve(key);
    const info = await stat(file).catch(() => null);
    if (!info) return new Response("Not found", { status: 404 });

    const headers = new Headers({
      "Content-Type": options.contentType,
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });
    if (options.downloadFilename) {
      headers.set("Content-Disposition", contentDisposition(options.downloadFilename));
    }

    const range = parseRange(options.range ?? null, info.size);
    if (range === "invalid") {
      headers.set("Content-Range", `bytes */${info.size}`);
      return new Response(null, { status: 416, headers });
    }
    if (range) {
      headers.set("Content-Range", `bytes ${range.start}-${range.end}/${info.size}`);
      headers.set("Content-Length", String(range.end - range.start + 1));
      const stream = createReadStream(file, { start: range.start, end: range.end });
      return new Response(Readable.toWeb(stream) as ReadableStream, { status: 206, headers });
    }
    headers.set("Content-Length", String(info.size));
    return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, { status: 200, headers });
  }
}

export function contentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/** Parses a single `bytes=` range. Multi-range requests fall back to the full body. */
export function parseRange(header: string | null, size: number): { start: number; end: number } | null | "invalid" {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;
  let start: number;
  let end: number;
  if (rawStart === "") {
    if (rawEnd === "") return "invalid";
    const suffix = Number(rawEnd);
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Math.min(Number(rawEnd), size - 1);
  }
  if (start > end || start >= size) return "invalid";
  return { start, end };
}

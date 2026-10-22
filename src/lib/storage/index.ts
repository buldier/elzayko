import "server-only";
import { env } from "@/lib/env";
import { LocalStorage } from "./local";
import { S3Storage } from "./s3";
import type { StorageProvider } from "./types";

let instance: StorageProvider | undefined;

export function getStorage(): StorageProvider {
  if (instance) return instance;
  const config = env();
  instance =
    config.STORAGE_DRIVER === "s3"
      ? new S3Storage({
          bucket: config.S3_BUCKET!,
          region: config.S3_REGION!,
          endpoint: config.S3_ENDPOINT,
          accessKeyId: config.S3_ACCESS_KEY_ID!,
          secretAccessKey: config.S3_SECRET_ACCESS_KEY!,
          publicBaseUrl: config.S3_PUBLIC_BASE_URL!,
          forcePathStyle: config.S3_FORCE_PATH_STYLE,
        })
      : new LocalStorage(config.LOCAL_STORAGE_DIR);
  return instance;
}

/** Public URL for a derivative key, or null. Safe to call while rendering. */
export function derivativeUrl(key: string | null | undefined): string | null {
  return key ? getStorage().publicUrl(key) : null;
}

export type { StorageProvider } from "./types";

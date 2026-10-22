import "dotenv/config";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { vi } from "vitest";

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.STORAGE_DRIVER = "local";
process.env.EMAIL_DRIVER = "console";
process.env.LOCAL_STORAGE_DIR = mkdtempSync(path.join(tmpdir(), "elzayko-test-"));

// Next.js cache APIs are no-ops outside the framework runtime.
vi.mock("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
}));

// Request headers are controlled per test through `setRequestHeaders` (tests/support/request.ts).
vi.mock("next/headers", () => ({
  headers: async () => (globalThis as { __requestHeaders?: Headers }).__requestHeaders ?? new Headers(),
  cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {}, delete: () => {} }),
}));

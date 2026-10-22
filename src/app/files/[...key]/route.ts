import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";
import { isDerivativeKey } from "@/lib/storage/keys";

/**
 * Serves public image derivatives for the local storage driver.
 * Originals (uploads/…) never match the derivative pattern and are therefore unreachable here.
 */
export async function GET(_request: Request, { params }: RouteContext<"/files/[...key]">) {
  const { key: segments } = await params;
  const key = segments.join("/");
  const config = env();
  if (config.STORAGE_DRIVER !== "local" || !isDerivativeKey(key)) {
    return new Response("Not found", { status: 404 });
  }
  const root = path.resolve(config.LOCAL_STORAGE_DIR);
  const file = path.resolve(root, key);
  if (!file.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });

  try {
    const body = await readFile(file);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

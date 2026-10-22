import { getGalleryPage } from "@/features/media/queries";
import { parseGalleryFilters } from "@/features/media/schemas";

/** Public, paginated JSON feed of published media (same filters as /gallery). */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const page = await getGalleryPage(parseGalleryFilters(params));
  return Response.json(page, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" } });
}

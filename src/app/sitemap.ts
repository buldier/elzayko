import type { MetadataRoute } from "next";
import { getSitemapMedia } from "@/features/media/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const media = await getSitemapMedia();
  const pages = ["", "/gallery", "/about", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/gallery" ? ("weekly" as const) : ("yearly" as const),
    priority: path === "" ? 1 : path === "/gallery" ? 0.9 : 0.5,
  }));
  return [
    ...pages,
    ...media.map((item) => ({
      url: `${base}/gallery/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

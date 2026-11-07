/**
 * Imports a set of photographs into the gallery through the same pipeline as an
 * admin upload (metadata stripped, WebP display/thumb derivatives, blur placeholder),
 * and can archive older items and repoint the About portrait / hero image.
 *
 *   npx tsx --conditions=react-server prisma/import-photos.ts path/to/manifest.json
 *
 * Paths in the manifest are relative to the manifest file. Re-running is safe:
 * photos whose slug already exists are skipped, archiving is idempotent.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client";
import { processImage } from "../src/features/media/image-processing";
import { getStorage } from "../src/lib/storage";
import { newDerivativePrefix, newUploadKey } from "../src/lib/storage/keys";

type Manifest = {
  categories?: { slug: string; name: string; description?: string }[];
  collection?: { slug: string; title: string; description?: string; featured?: boolean };
  photos: {
    file: string;
    slug: string;
    title: string;
    caption?: string;
    altText: string;
    category?: string;
    featured?: boolean;
    allowDownload?: boolean;
  }[];
  /** Slugs to move to ARCHIVED (hidden from the public site, kept in the studio). */
  archive?: string[];
  /** Slug of the photo used as the About portrait (also the profile card). */
  portrait?: string;
  /** Slug of the photo used as the site hero image. */
  hero?: string;
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error("Usage: import-photos.ts <manifest.json>");
  const baseDir = path.dirname(path.resolve(manifestPath));
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
  const storage = getStorage();
  const author = await prisma.user.findFirst({ where: { role: "admin" }, select: { id: true } });

  for (const [i, category] of (manifest.categories ?? []).entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description ?? null,
        sortOrder: i,
      },
      update: { name: category.name, description: category.description ?? null },
    });
  }
  const categoryIds = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  const collection = manifest.collection
    ? await prisma.collection.upsert({
        where: { slug: manifest.collection.slug },
        create: {
          slug: manifest.collection.slug,
          title: manifest.collection.title,
          description: manifest.collection.description ?? null,
          featured: manifest.collection.featured ?? false,
        },
        update: {
          title: manifest.collection.title,
          description: manifest.collection.description ?? null,
          featured: manifest.collection.featured ?? false,
        },
      })
    : null;

  // Earlier entries are published most recently, so manifest order is display order.
  const now = Date.now();
  for (const [i, photo] of manifest.photos.entries()) {
    let media = await prisma.media.findUnique({ where: { slug: photo.slug } });
    if (media) {
      console.log(`  = ${photo.slug} (exists, skipped)`);
    } else {
      const source = await readFile(path.join(baseDir, photo.file));
      // Normalise every original to a high-quality JPEG with no metadata.
      const original = await sharp(source).rotate().jpeg({ quality: 90, mozjpeg: true }).toBuffer();
      const processed = await processImage(original);
      const key = newUploadKey("jpg");
      const prefix = newDerivativePrefix();
      await storage.put(key, original, "image/jpeg");
      await storage.put(`${prefix}/display.webp`, processed.display, "image/webp");
      await storage.put(`${prefix}/thumb.webp`, processed.thumb, "image/webp");
      const publishedAt = new Date(now - i * 60_000);
      media = await prisma.media.create({
        data: {
          slug: photo.slug,
          title: photo.title,
          caption: photo.caption ?? null,
          altText: photo.altText,
          status: "PUBLISHED",
          featured: photo.featured ?? false,
          allowDownload: photo.allowDownload ?? false,
          categoryId: photo.category ? (categoryIds[photo.category] ?? null) : null,
          mediaType: "IMAGE",
          sourceType: "UPLOAD",
          storageKey: key,
          displayKey: `${prefix}/display.webp`,
          thumbnailKey: `${prefix}/thumb.webp`,
          blurDataUrl: processed.blurDataUrl,
          mimeType: "image/jpeg",
          fileSize: original.length,
          width: processed.width,
          height: processed.height,
          publishedAt,
          createdAt: publishedAt,
          authorId: author?.id ?? null,
        },
      });
      console.log(`  + ${photo.slug} (${processed.width}×${processed.height})`);
    }
    if (collection) {
      await prisma.collectionItem.upsert({
        where: { collectionId_mediaId: { collectionId: collection.id, mediaId: media.id } },
        create: { collectionId: collection.id, mediaId: media.id, position: i },
        update: { position: i },
      });
    }
  }

  if (manifest.archive?.length) {
    const { count } = await prisma.media.updateMany({
      where: { slug: { in: manifest.archive }, status: { not: "ARCHIVED" } },
      data: { status: "ARCHIVED", featured: false },
    });
    console.log(`  archived ${count} item(s)`);
  }

  const idFor = async (slug: string) =>
    (await prisma.media.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null;

  if (manifest.portrait) {
    const portraitId = await idFor(manifest.portrait);
    const about = await prisma.page.findUnique({ where: { slug: "about" } });
    if (about && portraitId) {
      const content = {
        ...(about.content as Record<string, unknown>),
        portraitMediaId: portraitId,
      };
      await prisma.page.update({ where: { id: about.id }, data: { content } });
      console.log(`  about portrait → ${manifest.portrait}`);
    }
  }
  if (manifest.hero) {
    const heroId = await idFor(manifest.hero);
    if (heroId) {
      await prisma.siteSettings.update({ where: { id: 1 }, data: { heroMediaId: heroId } });
      console.log(`  hero image → ${manifest.hero}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

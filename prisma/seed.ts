/**
 * Development seed. Idempotent: re-running updates copy and skips images that already exist.
 * Run with `npm run db:seed` (uses the react-server export condition so server-only modules load).
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { processImage } from "../src/features/media/image-processing";
import { resolveExternalMedia } from "../src/features/media/providers";
import { PAGE_DEFAULTS } from "../src/features/pages/defaults";
import { DEFAULT_SETTINGS } from "../src/features/settings/service";
import { getStorage } from "../src/lib/storage";
import { newDerivativePrefix, newUploadKey } from "../src/lib/storage/keys";
import { slugify } from "../src/lib/utils/slug";
import { renderArt } from "./fixtures/art";
import { CATEGORIES, COLLECTIONS, EXTERNAL, IMAGES } from "./fixtures/content";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const DAY = 24 * 60 * 60 * 1000;

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("• ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user");
    return null;
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

  const hash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });
  const user =
    existing ??
    (await prisma.user.create({
      data: { id: randomUUID(), email, name: process.env.ADMIN_NAME ?? "Administrator", emailVerified: true, role: "admin" },
    }));
  if (existing && existing.role !== "admin") await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });

  const account = await prisma.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
  if (account) {
    await prisma.account.update({ where: { id: account.id }, data: { password: hash } });
  } else {
    await prisma.account.create({
      data: { id: randomUUID(), userId: user.id, accountId: user.id, providerId: "credential", password: hash },
    });
  }
  console.log(`• Admin ready: ${email}`);
  return user;
}

async function seedTaxonomy() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: category.slug }, create: category, update: category });
  }
  for (const collection of COLLECTIONS) {
    await prisma.collection.upsert({ where: { slug: collection.slug }, create: collection, update: collection });
  }
  console.log(`• ${CATEGORIES.length} categories, ${COLLECTIONS.length} collections`);
}

async function connectTags(mediaId: string, names: string[]) {
  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({ where: { slug }, create: { slug, name }, update: {} });
    await prisma.mediaTag.upsert({
      where: { mediaId_tagId: { mediaId, tagId: tag.id } },
      create: { mediaId, tagId: tag.id },
      update: {},
    });
  }
}

/**
 * Fetches an Unsplash-licensed sample photo from picsum.photos with its author credit.
 * Returns null when offline so the seed falls back to generated artwork.
 */
async function fetchPhoto(id: number, width: number, height: number): Promise<{ bytes: Buffer; credit: string } | null> {
  if (process.env.SEED_OFFLINE === "1") return null;
  try {
    const [image, info] = await Promise.all([
      fetch(`https://picsum.photos/id/${id}/${width}/${height}.jpg`, { signal: AbortSignal.timeout(20_000) }),
      fetch(`https://picsum.photos/id/${id}/info`, { signal: AbortSignal.timeout(20_000) }),
    ]);
    if (!image.ok) return null;
    const meta = info.ok ? ((await info.json()) as { author?: string; url?: string }) : {};
    const credit = `Sample photograph by ${meta.author ?? "an Unsplash contributor"} (Unsplash License${meta.url ? `, ${meta.url}` : ""}). Replace with your own work.`;
    return { bytes: Buffer.from(await image.arrayBuffer()), credit };
  } catch {
    return null;
  }
}

async function seedImages(authorId: string | null) {
  const storage = getStorage();
  const categoryIds = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));
  const collectionIds = Object.fromEntries((await prisma.collection.findMany()).map((c) => [c.slug, c.id]));
  let created = 0;

  for (const fixture of IMAGES) {
    const publishedAt = fixture.status === "DRAFT" ? null : new Date(Date.now() - fixture.daysAgo * DAY);
    const metadata = {
      title: fixture.title,
      caption: fixture.caption,
      description: (fixture.description ?? null) as string | null,
      altText: fixture.altText,
      status: fixture.status ?? ("PUBLISHED" as const),
      featured: fixture.featured ?? false,
      allowDownload: fixture.allowDownload ?? false,
      categoryId: categoryIds[fixture.category] ?? null,
    };

    let media = await prisma.media.findUnique({ where: { slug: fixture.slug } });
    if (media) {
      // Keep the stored description: it may carry the photo credit added on first creation.
      media = await prisma.media.update({ where: { id: media.id }, data: { ...metadata, description: undefined } });
    } else {
      const photo = await fetchPhoto(fixture.photo.id, fixture.art.width, fixture.art.height);
      const original = photo?.bytes ?? (await renderArt(fixture.art));
      if (photo) metadata.description = [fixture.description, photo.credit].filter(Boolean).join("\n\n");
      const processed = await processImage(original);
      const key = newUploadKey("jpg");
      const prefix = newDerivativePrefix();
      await storage.put(key, original, "image/jpeg");
      await storage.put(`${prefix}/display.webp`, processed.display, "image/webp");
      await storage.put(`${prefix}/thumb.webp`, processed.thumb, "image/webp");
      media = await prisma.media.create({
        data: {
          ...metadata,
          slug: fixture.slug,
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
          createdAt: new Date(Date.now() - fixture.daysAgo * DAY),
          authorId,
        },
      });
      created++;
    }
    await connectTags(media.id, fixture.tags);
    for (const slug of fixture.collections) {
      const collectionId = collectionIds[slug];
      if (!collectionId) continue;
      await prisma.collectionItem.upsert({
        where: { collectionId_mediaId: { collectionId, mediaId: media.id } },
        create: { collectionId, mediaId: media.id },
        update: {},
      });
    }
  }
  console.log(`• ${IMAGES.length} images (${created} newly created)`);
}

async function seedExternal(authorId: string | null) {
  const categoryIds = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));
  for (const fixture of EXTERNAL) {
    const resolved = resolveExternalMedia(fixture.url);
    const data = {
      title: fixture.title,
      caption: fixture.caption,
      description: fixture.description ?? null,
      altText: fixture.title,
      mediaType: resolved.mediaType,
      sourceType: "EXTERNAL" as const,
      provider: resolved.provider,
      externalId: resolved.externalId,
      externalUrl: resolved.url,
      thumbnailUrl: resolved.thumbnailUrl,
      status: "PUBLISHED" as const,
      featured: fixture.featured,
      categoryId: fixture.category ? (categoryIds[fixture.category] ?? null) : null,
      publishedAt: new Date(Date.now() - fixture.daysAgo * DAY),
    };
    const media = await prisma.media.upsert({
      where: { slug: fixture.slug },
      create: { ...data, slug: fixture.slug, authorId },
      update: data,
    });
    await connectTags(media.id, fixture.tags);
  }
  console.log(`• ${EXTERNAL.length} external items`);
}

async function seedPagesAndSettings() {
  const portrait = await prisma.media.findUnique({ where: { slug: "window-seat-3pm" }, select: { id: true } });
  for (const [slug, page] of Object.entries(PAGE_DEFAULTS)) {
    const content = (slug === "about" ? { ...page.content, portraitMediaId: portrait?.id ?? null } : page.content) as Prisma.InputJsonValue;
    await prisma.page.upsert({ where: { slug }, create: { slug, title: page.title, content }, update: {} });
  }
  const settings = { ...DEFAULT_SETTINGS, contactEmail: "hello@elzayko.example", location: "Somewhere by the sea" };
  await prisma.siteSettings.upsert({ where: { id: 1 }, create: { id: 1, ...settings }, update: {} });
  console.log("• Pages and site settings");
}

async function main() {
  console.log("Seeding Elzayko…");
  const admin = await seedAdmin();
  await seedTaxonomy();
  await seedImages(admin?.id ?? null);
  await seedExternal(admin?.id ?? null);
  await seedPagesAndSettings();
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import "server-only";
import { Prisma } from "@/generated/prisma/client";
import type { MediaStatus } from "@/generated/prisma/enums";
import type { AdminUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppError, validationError } from "@/lib/utils/result";
import { slugify, uniqueSlug } from "@/lib/utils/slug";
import { ExternalUrlError, resolveExternalMedia } from "./providers";
import { mediaRepository } from "./repository";
import {
  createMediaSchema,
  updateMediaSchema,
  type CreateMediaInput,
  type UpdateMediaInput,
} from "./schemas";
import { deleteStoredObjects, inspectUpload, processImageUpload, type ProcessedUpload } from "./upload-service";

type Tx = Prisma.TransactionClient;

function parseOrThrow<T>(
  result: { success: true; data: T } | { success: false; error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] } },
): T {
  if (result.success) return result.data;
  throw validationError(result.error.issues);
}

function resolveExternal(url: string) {
  try {
    return resolveExternalMedia(url);
  } catch (error) {
    if (error instanceof ExternalUrlError) throw new AppError(error.message);
    throw error;
  }
}

async function resolveSlug(requested: string | undefined, title: string, exceptId?: string): Promise<string> {
  if (requested) {
    if (await mediaRepository.slugExists(requested, exceptId)) {
      throw new AppError("That slug is already used by another item", "CONFLICT");
    }
    return requested;
  }
  return uniqueSlug(title, (candidate) => mediaRepository.slugExists(candidate, exceptId), 120);
}

async function assertTaxonomyExists(categoryId: string | null | undefined, collectionIds: string[]) {
  if (categoryId) {
    const found = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!found) throw new AppError("Selected category no longer exists");
  }
  if (collectionIds.length) {
    const count = await prisma.collection.count({ where: { id: { in: collectionIds } } });
    if (count !== new Set(collectionIds).size) throw new AppError("A selected collection no longer exists");
  }
}

async function syncTags(tx: Tx, mediaId: string, names: string[]) {
  const unique = new Map<string, string>();
  for (const name of names) {
    const slug = slugify(name, 60);
    if (slug && !unique.has(slug)) unique.set(slug, name.trim());
  }
  await tx.mediaTag.deleteMany({ where: { mediaId } });
  for (const [slug, name] of unique) {
    const tag = await tx.tag.upsert({ where: { slug }, create: { slug, name }, update: {}, select: { id: true } });
    await tx.mediaTag.create({ data: { mediaId, tagId: tag.id } });
  }
}

async function syncCollections(tx: Tx, mediaId: string, collectionIds: string[]) {
  await tx.collectionItem.deleteMany({ where: { mediaId, collectionId: { notIn: collectionIds } } });
  for (const collectionId of new Set(collectionIds)) {
    await tx.collectionItem.upsert({
      where: { collectionId_mediaId: { collectionId, mediaId } },
      create: { collectionId, mediaId },
      update: {},
    });
  }
}

function assertPublishable(input: { status: MediaStatus; altText?: string | null }, mediaType: string) {
  if (input.status === "PUBLISHED" && mediaType === "IMAGE" && !input.altText) {
    throw new AppError("Add alt text before publishing an image");
  }
}

function translatePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") throw new AppError("That slug or file is already in use", "CONFLICT");
    if (error.code === "P2003") throw new AppError("A referenced category or collection no longer exists");
  }
  throw error;
}

/** Creates an uploaded or external media item. Requires a verified admin. */
export async function createMedia(admin: AdminUser, raw: CreateMediaInput) {
  const input = parseOrThrow(createMediaSchema.safeParse(raw));
  await assertTaxonomyExists(input.categoryId, input.collectionIds);
  const slug = await resolveSlug(input.slug || undefined, input.title);
  const publishedAt = input.status === "PUBLISHED" ? new Date() : null;

  const common = {
    title: input.title,
    slug,
    description: input.description ?? null,
    caption: input.caption ?? null,
    altText: input.altText ?? null,
    status: input.status,
    featured: input.featured,
    publishedAt,
    categoryId: input.categoryId ?? null,
    authorId: admin.id,
  };

  let data: Prisma.MediaUncheckedCreateInput;
  let createdKeys: string[] = [];

  if (input.source === "external") {
    const resolved = resolveExternal(input.url);
    assertPublishable(input, resolved.mediaType);
    data = {
      ...common,
      mediaType: resolved.mediaType,
      sourceType: "EXTERNAL",
      provider: resolved.provider,
      externalId: resolved.externalId,
      externalUrl: resolved.url,
      thumbnailUrl: resolved.thumbnailUrl,
      allowDownload: false,
    };
  } else {
    if (await mediaRepository.storageKeyInUse(input.storageKey)) {
      throw new AppError("This upload is already attached to another item", "CONFLICT");
    }
    const declaredKind = input.storageKey.match(/\.(mp4|webm|mov)$/) ? "video" : "image";
    assertPublishable(input, declaredKind === "image" ? "IMAGE" : "VIDEO");

    if (declaredKind === "image") {
      const image = await processImageUpload(input.storageKey);
      createdKeys = [image.displayKey, image.thumbnailKey];
      data = {
        ...common,
        ...uploadedImageFields(image),
        mediaType: "IMAGE",
        sourceType: "UPLOAD",
        storageKey: image.key,
        allowDownload: input.allowDownload,
      };
    } else {
      const video = await inspectUpload(input.storageKey, "video");
      const poster = input.posterKey ? await processImageUpload(input.posterKey) : null;
      if (poster) createdKeys = [poster.displayKey, poster.thumbnailKey];
      data = {
        ...common,
        mediaType: "VIDEO",
        sourceType: "UPLOAD",
        storageKey: video.key,
        mimeType: video.mime,
        fileSize: video.size,
        width: input.videoMeta?.width ?? poster?.width ?? null,
        height: input.videoMeta?.height ?? poster?.height ?? null,
        duration: input.videoMeta?.duration != null ? Math.round(input.videoMeta.duration) : null,
        posterKey: poster?.key ?? null,
        displayKey: poster?.displayKey ?? null,
        thumbnailKey: poster?.thumbnailKey ?? null,
        blurDataUrl: poster?.blurDataUrl ?? null,
        allowDownload: false,
      };
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const media = await tx.media.create({ data, select: { id: true, slug: true, status: true } });
      await syncTags(tx, media.id, input.tags);
      await syncCollections(tx, media.id, input.collectionIds);
      return media;
    });
  } catch (error) {
    await deleteStoredObjects(createdKeys);
    translatePrismaError(error);
  }
}

function uploadedImageFields(image: ProcessedUpload) {
  return {
    mimeType: image.mime,
    fileSize: image.size,
    width: image.width,
    height: image.height,
    displayKey: image.displayKey,
    thumbnailKey: image.thumbnailKey,
    blurDataUrl: image.blurDataUrl,
  };
}

/** Updates metadata, flags, status and (for externals) the URL of an item. */
export async function updateMedia(_admin: AdminUser, raw: UpdateMediaInput) {
  const input = parseOrThrow(updateMediaSchema.safeParse(raw));
  const existing = await prisma.media.findUnique({ where: { id: input.id } });
  if (!existing) throw new AppError("Media not found", "NOT_FOUND");

  await assertTaxonomyExists(input.categoryId, input.collectionIds);
  assertPublishable(input, existing.mediaType);
  const slug = input.slug && input.slug !== existing.slug ? await resolveSlug(input.slug, input.title, existing.id) : existing.slug;

  const data: Prisma.MediaUncheckedUpdateInput = {
    title: input.title,
    slug,
    description: input.description ?? null,
    caption: input.caption ?? null,
    altText: input.altText ?? null,
    status: input.status,
    featured: input.featured,
    categoryId: input.categoryId ?? null,
    allowDownload: existing.mediaType === "IMAGE" && existing.sourceType === "UPLOAD" ? input.allowDownload : false,
    publishedAt: input.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
  };

  if (existing.sourceType === "EXTERNAL" && input.url && input.url !== existing.externalUrl) {
    const resolved = resolveExternal(input.url);
    if (resolved.mediaType !== existing.mediaType) {
      throw new AppError(`This item is a ${existing.mediaType.toLowerCase()}; create a new item for a different kind of link`);
    }
    Object.assign(data, {
      provider: resolved.provider,
      externalId: resolved.externalId,
      externalUrl: resolved.url,
      thumbnailUrl: resolved.thumbnailUrl,
    });
  }

  let replacedKeys: (string | null)[] = [];
  let createdKeys: string[] = [];
  const isUploadedVideo = existing.sourceType === "UPLOAD" && existing.mediaType === "VIDEO";
  if (isUploadedVideo && input.posterKey !== undefined && input.posterKey !== existing.posterKey) {
    if (input.posterKey) {
      if (await mediaRepository.storageKeyInUse(input.posterKey)) throw new AppError("This upload is already in use", "CONFLICT");
      const poster = await processImageUpload(input.posterKey);
      createdKeys = [poster.displayKey, poster.thumbnailKey];
      Object.assign(data, {
        posterKey: poster.key,
        displayKey: poster.displayKey,
        thumbnailKey: poster.thumbnailKey,
        blurDataUrl: poster.blurDataUrl,
        width: existing.width ?? poster.width,
        height: existing.height ?? poster.height,
      });
    } else {
      Object.assign(data, { posterKey: null, displayKey: null, thumbnailKey: null, blurDataUrl: null });
    }
    replacedKeys = [existing.posterKey, existing.displayKey, existing.thumbnailKey];
  }

  try {
    const media = await prisma.$transaction(async (tx) => {
      const updated = await tx.media.update({ where: { id: existing.id }, data, select: { id: true, slug: true, status: true } });
      await syncTags(tx, existing.id, input.tags);
      await syncCollections(tx, existing.id, input.collectionIds);
      return updated;
    });
    await deleteStoredObjects(replacedKeys);
    return media;
  } catch (error) {
    await deleteStoredObjects(createdKeys);
    translatePrismaError(error);
  }
}

export async function setMediaStatus(_admin: AdminUser, id: string, status: MediaStatus) {
  const existing = await prisma.media.findUnique({ where: { id }, select: { id: true, mediaType: true, altText: true, publishedAt: true } });
  if (!existing) throw new AppError("Media not found", "NOT_FOUND");
  assertPublishable({ status, altText: existing.altText }, existing.mediaType);
  return prisma.media.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt },
    select: { id: true, status: true },
  });
}

export async function setMediaFeatured(_admin: AdminUser, id: string, featured: boolean) {
  const updated = await prisma.media.updateMany({ where: { id }, data: { featured } });
  if (updated.count === 0) throw new AppError("Media not found", "NOT_FOUND");
}

/** Deletes the row first, then its stored objects (orphaned objects are harmless; dangling rows are not). */
export async function deleteMedia(_admin: AdminUser, id: string) {
  const existing = await prisma.media.findUnique({
    where: { id },
    select: { id: true, storageKey: true, displayKey: true, thumbnailKey: true, posterKey: true },
  });
  if (!existing) throw new AppError("Media not found", "NOT_FOUND");
  await prisma.media.delete({ where: { id } });
  await deleteStoredObjects([existing.storageKey, existing.displayKey, existing.thumbnailKey, existing.posterKey]);
  return { id };
}

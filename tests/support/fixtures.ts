import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "@/lib/db/prisma";
import { getStorage } from "@/lib/storage";
import { newUploadKey } from "@/lib/storage/keys";

export const ADMIN_PASSWORD = "integration-password-123";

export async function createUser(role: "admin" | "viewer", email = `${role}-${randomUUID()}@test.local`) {
  const user = await prisma.user.create({ data: { id: randomUUID(), email, name: `${role} user`, emailVerified: true, role } });
  await prisma.account.create({
    data: { id: randomUUID(), userId: user.id, accountId: user.id, providerId: "credential", password: await hashPassword(ADMIN_PASSWORD) },
  });
  return user;
}

export async function jpegBuffer(width = 320, height = 240) {
  return sharp({ create: { width, height, channels: 3, background: "#7a3b2e" } }).jpeg().toBuffer();
}

/** Simulates a completed browser upload by writing bytes straight to storage. */
export async function storeUpload(bytes: Buffer, extension = "jpg") {
  const key = newUploadKey(extension);
  await getStorage().put(key, bytes, "application/octet-stream");
  return key;
}

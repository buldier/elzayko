import { beforeAll, describe, expect, it } from "vitest";
import { GET as download } from "@/app/api/media/[id]/download/route";
import { DELETE as deleteRoute } from "@/app/api/media/[id]/route";
import { POST as requestUpload } from "@/app/api/uploads/route";
import { GET as files } from "@/app/files/[...key]/route";
import { createMediaAction, deleteMediaAction } from "@/features/media/actions";
import { createMedia } from "@/features/media/service";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ADMIN_PASSWORD, createUser, jpegBuffer, storeUpload } from "../support/fixtures";
import { setRequestHeaders } from "../support/request";

const ORIGIN = "http://localhost:3000";

async function sessionCookie(email: string) {
  const { headers } = await auth.api.signInEmail({ body: { email, password: ADMIN_PASSWORD }, returnHeaders: true });
  return headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
}

function uploadRequest(cookie?: string) {
  return new Request(`${ORIGIN}/api/uploads`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, ...(cookie ? { cookie } : {}) },
    body: JSON.stringify({ kind: "image", filename: "a.jpg", contentType: "image/jpeg", size: 1234 }),
  });
}

let adminCookie: string;
let viewerCookie: string;
let adminId: string;

beforeAll(async () => {
  const admin = await createUser("admin");
  const viewer = await createUser("viewer");
  adminId = admin.id;
  adminCookie = await sessionCookie(admin.email);
  viewerCookie = await sessionCookie(viewer.email);
});

describe("upload authorization", () => {
  it("rejects anonymous requests", async () => {
    setRequestHeaders();
    expect((await requestUpload(uploadRequest())).status).toBe(401);
  });

  it("rejects authenticated non-admins", async () => {
    setRequestHeaders({ cookie: viewerCookie });
    expect((await requestUpload(uploadRequest(viewerCookie))).status).toBe(401);
  });

  it("issues a signed upload target to admins", async () => {
    setRequestHeaders({ cookie: adminCookie });
    const response = await requestUpload(uploadRequest(adminCookie));
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.key).toMatch(/^uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.jpg$/);
    expect(body.upload.url).toMatch(/^\/api\/uploads\/local\?token=/);
  });

  it("rejects cross-site requests even with a valid session", async () => {
    setRequestHeaders({ cookie: adminCookie });
    const request = new Request(`${ORIGIN}/api/uploads`, { method: "POST", headers: { origin: "https://evil.example", cookie: adminCookie }, body: "{}" });
    expect((await requestUpload(request)).status).toBe(403);
  });
});

describe("server actions and admin APIs", () => {
  it("redirects anonymous callers of admin actions to /login", async () => {
    setRequestHeaders();
    await expect(createMediaAction({ source: "external", url: "https://youtu.be/aqz-KE-bpKQ", title: "x", tags: [], collectionIds: [] })).rejects.toMatchObject({
      digest: expect.stringContaining("/login"),
    });
    await expect(deleteMediaAction("anything")).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_REDIRECT") });
  });

  it("does not let a viewer delete media through the API", async () => {
    const { id } = await createMedia({ id: adminId, name: "a", email: "a" }, { source: "external", url: "https://youtu.be/aqz-KE-bpKQ", title: "Protected", tags: [], collectionIds: [] });
    setRequestHeaders({ cookie: viewerCookie });
    const response = await deleteRoute(new Request(`${ORIGIN}/api/media/${id}`, { method: "DELETE", headers: { origin: ORIGIN } }), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(401);
    expect(await prisma.media.findUnique({ where: { id } })).not.toBeNull();
  });
});

describe("downloads and file serving", () => {
  it("serves only published, download-enabled images", async () => {
    const admin = { id: adminId, name: "a", email: "a" };
    const allowed = await createMedia(admin, { source: "upload", storageKey: await storeUpload(await jpegBuffer()), title: "Allowed", altText: "a", status: "PUBLISHED", allowDownload: true, tags: [], collectionIds: [] });
    const disabled = await createMedia(admin, { source: "upload", storageKey: await storeUpload(await jpegBuffer()), title: "Disabled", altText: "a", status: "PUBLISHED", tags: [], collectionIds: [] });
    const draft = await createMedia(admin, { source: "upload", storageKey: await storeUpload(await jpegBuffer()), title: "Draft dl", altText: "a", allowDownload: true, tags: [], collectionIds: [] });
    const get = (id: string) => download(new Request(`${ORIGIN}/api/media/${id}/download`, { headers: { "x-forwarded-for": "203.0.113.9" } }), { params: Promise.resolve({ id }) });

    const ok = await get(allowed.id);
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-disposition")).toMatch(/^attachment; filename="elzayko-allowed\.jpg"/);
    expect((await get(disabled.id)).status).toBe(404);
    expect((await get(draft.id)).status).toBe(404);
    expect((await get("doesnotexist")).status).toBe(404);
  });

  it("never serves original uploads from the public file route", async () => {
    const key = await storeUpload(await jpegBuffer());
    const response = await files(new Request(`${ORIGIN}/files/${key}`), { params: Promise.resolve({ key: key.split("/") }) });
    expect(response.status).toBe(404);
    const traversal = await files(new Request(`${ORIGIN}/files/x`), { params: Promise.resolve({ key: ["derivatives", "..", "..", ".env"] }) });
    expect(traversal.status).toBe(404);
  });
});

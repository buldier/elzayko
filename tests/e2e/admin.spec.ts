import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { login, withFreshIp } from "./helpers";

test("admin routes require authentication", async ({ page, request }) => {
  await page.goto("/admin/media");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fmedia/);
  expect((await request.post("/api/uploads", { data: {}, headers: { origin: "http://localhost:3000" } })).status()).toBe(401);
  expect((await request.delete("/api/media/anything", { headers: { origin: "http://localhost:3000" } })).status()).toBe(401);
});

test("wrong credentials are rejected", async ({ page }) => {
  await withFreshIp(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@elzayko.local");
  await page.getByLabel("Password").fill("definitely-wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
});

test("admin uploads, publishes and deletes an image", async ({ page }, testInfo) => {
  const title = `E2E upload ${Date.now()}`;
  await mkdir(testInfo.outputDir, { recursive: true });
  const file = path.join(testInfo.outputDir, "e2e-upload.jpg");
  await sharp({ create: { width: 900, height: 1200, channels: 3, background: "#5e2b21" } }).jpeg().toFile(file);

  await login(page);
  await page.goto("/admin/media/new");
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByLabel("Title")).toBeVisible({ timeout: 30_000 });
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Alternative text").fill("A deep rosewood rectangle.");
  await page.getByLabel("Status").selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForURL(/\/admin\/media\/\w+\/edit$/, { timeout: 30_000 });

  const slug = await page.getByLabel("URL slug").inputValue();
  await page.goto(`/gallery/${slug}`);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();

  await page.goto("/admin/media?q=" + encodeURIComponent(title));
  await page.getByRole("button", { name: `Delete “${title}”` }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.getByText("Media deleted")).toBeVisible();

  await page.goto(`/gallery/${slug}`);
  await expect(page.getByText("This work isn’t available")).toBeVisible();
});

test("unsupported files are refused before upload", async ({ page }, testInfo) => {
  await mkdir(testInfo.outputDir, { recursive: true });
  const file = path.join(testInfo.outputDir, "notes.txt");
  await writeFile(file, "not an image");
  await login(page);
  await page.goto("/admin/media/new");
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText(/unsupported format/)).toBeVisible();
});

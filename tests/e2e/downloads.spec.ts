import { expect, test } from "@playwright/test";
import { withFreshIp } from "./helpers";

test("downloadable images can be downloaded", async ({ page }) => {
  await withFreshIp(page);
  await page.goto("/gallery/low-tide-november");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /Download/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("elzayko-low-tide-november.jpg");
});

test("images without download permission expose no download", async ({ page, request }) => {
  await page.goto("/gallery/window-seat-3pm");
  await expect(page.getByRole("link", { name: /Download/ })).toHaveCount(0);
  await expect(page.getByText("Not offered")).toBeVisible();

  const html = await (await request.get("/gallery/window-seat-3pm")).text();
  expect(html).not.toContain("/download");
  expect(html).not.toMatch(/uploads\/\d{4}\//);
});

test("the download endpoint refuses non-downloadable ids", async ({ request }) => {
  expect((await request.get("/api/media/not-a-real-id/download")).status()).toBe(404);
});

import { expect, test } from "@playwright/test";

test("homepage presents the identity and featured work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Enter the gallery/ })).toBeVisible();
  await expect(page.locator("main img").first()).toBeVisible();
});

test("primary navigation reaches every public page", async ({ page, isMobile }) => {
  await page.goto("/");
  const destinations = [
    { name: "Gallery", path: "/gallery" },
    { name: "About Us", path: "/about", group: "Pages" },
    { name: "Contact Us", path: "/contact" },
  ];
  for (const { name, path, group } of destinations) {
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const nav = page.getByRole("navigation", { name: "Primary" });
    if (group && isMobile) await nav.getByRole("button", { name: `Show ${group} links` }).click();
    else if (group) await nav.getByRole("link", { name: group, exact: true }).hover();
    await nav.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("gallery filters by type and search, and paginates server-side", async ({ page }) => {
  await page.goto("/gallery");
  await page.getByRole("link", { name: "Films" }).click();
  await expect(page).toHaveURL(/type=video/);
  await expect(page.getByRole("link", { name: /\(video\)/ }).first()).toBeVisible();

  await page.goto("/gallery");
  await page.getByLabel("Search by title, caption or tag").fill("harbour");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/q=harbour/);
  await expect(page.getByRole("heading", { name: "Harbour Light" })).toBeVisible();

  await page.goto("/gallery?q=zzzz-no-match");
  await expect(page.getByText("Nothing matches those filters")).toBeVisible();
});

test("lightbox opens from quick view and navigates with the keyboard", async ({ page }) => {
  await page.goto("/gallery?type=image");
  await page.getByRole("button", { name: /^Quick view:/ }).first().focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const first = await dialog.getAttribute("aria-label");
  await page.keyboard.press("ArrowRight");
  await expect(dialog).not.toHaveAttribute("aria-label", first!);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("media detail shows metadata, related work and canonical URL", async ({ page }) => {
  await page.goto("/gallery/low-tide-november");
  await expect(page.getByRole("heading", { level: 1, name: "Low Tide, November" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/gallery\/low-tide-november$/);
  await expect(page.getByRole("heading", { name: "Related work" })).toBeVisible();
});

test("YouTube embeds only load after the visitor presses play", async ({ page }) => {
  await page.goto("/gallery/big-buck-bunny-sample");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: /Play/ }).click();
  await expect(page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"]')).toBeAttached();
});

test("unpublished and unknown items are not found", async ({ page }) => {
  await page.goto("/gallery/storm-study-draft");
  await expect(page.getByText("This work isn’t available")).toBeVisible();
});

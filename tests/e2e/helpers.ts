import type { Page } from "@playwright/test";

/** Unique client IP per test so app rate limits don't leak between runs. */
export async function withFreshIp(page: Page) {
  const ip = `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
}

export const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? "admin@elzayko.local",
  password: process.env.ADMIN_PASSWORD ?? "change-me-please-2026",
};

export async function login(page: Page) {
  await withFreshIp(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");
}

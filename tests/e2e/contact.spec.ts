import { expect, test } from "@playwright/test";
import { withFreshIp } from "./helpers";

test("contact form validates on the server and confirms success", async ({ page }) => {
  await withFreshIp(page);
  await page.goto("/contact");
  await page.getByLabel("Name").fill("A");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact-name-error")).toHaveText("Please enter your name");
  await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");

  await page.waitForTimeout(3100); // minimum fill time (spam heuristic)
  await page.getByLabel("Name").fill("Playwright Visitor");
  await page.getByLabel("Email").fill("visitor@example.com");
  await page.getByLabel("Subject").fill("Print enquiry");
  await page.getByLabel("Message").fill("Hello — is the coastal series available as prints?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Thank you — your message has been sent.")).toBeVisible();
});

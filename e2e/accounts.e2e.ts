import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("accounts", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Accounts" }).first().click();
    await expect(page).toHaveURL(/\/accounts$/);
  });

  test("shows net worth, pillar allocation and grouped accounts", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Institutional accounts & vaults" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Accounts" }).first(),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("img", { name: "Wealth allocation by pillar" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Global ETFs" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Bank account" }),
    ).toBeVisible();
  });

  test("tabs filter the directory", async ({ page }) => {
    await page.getByRole("tab", { name: /Investments/ }).click();
    await expect(
      page.getByRole("heading", { name: "Global ETFs" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wallet" })).toHaveCount(0);

    await page.getByRole("tab", { name: /Bank & Cash/ }).click();
    await expect(page.getByRole("heading", { name: "Wallet" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Global ETFs" }),
    ).toHaveCount(0);
  });

  test("filters accounts by name", async ({ page }) => {
    await page.getByLabel("Filter accounts by name").fill("etf");
    await expect(
      page.getByRole("heading", { name: "Global ETFs" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wallet" })).toHaveCount(0);
  });
});

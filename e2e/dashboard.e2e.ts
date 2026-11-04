import { expect, test } from "@playwright/test";
import { completeWizard, login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("renders layout, balances, accounts and transactions", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Household HQ/);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Add record" })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Total liquid balance" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Household net worth" }),
    ).toBeVisible();

    const accounts = page.getByRole("region", { name: "Accounts" });
    await expect(
      accounts.getByRole("heading", { name: "Bank account" }),
    ).toBeVisible();
    await expect(
      accounts.getByRole("heading", { name: "Global ETFs" }),
    ).toBeVisible();
    await expect(
      accounts.getByRole("img", { name: "Portfolio allocation" }),
    ).toBeVisible();

    const txs = page.getByRole("region", { name: "Recent transactions" });
    await expect(txs.getByRole("heading", { name: "Salary" })).toBeVisible();
    await expect(
      txs.getByRole("heading", { name: "Rohlik delivery" }),
    ).toBeVisible();
  });

  test("adds a transaction, shows it and updates the balance, then deletes it", async ({
    page,
  }) => {
    const description = `E2E coffee ${Date.now()}`;
    await page.goto("/");

    const liquid = page
      .getByRole("article")
      .filter({ hasText: "Total liquid balance" });
    const before = (await liquid.textContent()) ?? "";

    await page.getByRole("link", { name: "Add record" }).click();
    await expect(page).toHaveURL(/\/transactions\/new$/);

    await completeWizard(page, { amount: "100", description });
    await expect(page).toHaveURL(/\/$/);
    const row = page.getByRole("listitem").filter({ hasText: description });
    await expect(row).toBeVisible();
    await expect(row).toContainText("100");
    await expect(liquid).not.toHaveText(before);

    await row.getByRole("button", { name: `Delete ${description}` }).click();
    await expect(row).toHaveCount(0);
    await expect(liquid).toHaveText(before);
  });

  test("mobile viewport swaps sidebar for bottom navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Mobile" }),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  });
});

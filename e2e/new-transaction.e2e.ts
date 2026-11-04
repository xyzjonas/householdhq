import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("add record wizard", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/transactions/new");
  });

  test("walks through the four stages and enforces validation", async ({
    page,
  }) => {
    const step = (name: string) => page.getByRole("button", { name });
    await expect(
      page.getByRole("heading", { name: /Type of transaction/ }),
    ).toBeVisible();
    await page.getByLabel("Income").check();
    await page.getByLabel("Expense").check();

    await step("Amount").click();
    // Zero amount cannot advance.
    await expect(step("Category")).toBeDisabled();

    // Calculator tape: 1200 + 250 = 1450
    for (const key of ["1", "2", "0", "0", "Plus", "2", "5", "0"]) {
      await step(key).click();
    }
    await expect(page.getByText("= 1 450 Kč")).toBeVisible();
    await step("=").click();
    await expect(page.getByRole("status")).toHaveText("1450");

    // Long-press backspace clears the whole amount.
    const backspace = step("Backspace (hold to clear)");
    await backspace.dispatchEvent("pointerdown");
    await page.waitForTimeout(600);
    await backspace.dispatchEvent("pointerup");
    await expect(page.getByRole("status")).toHaveText("0");
    await step("5").click();

    await step("Category").click();
    await expect(step("Details")).toBeDisabled();
    await page.getByLabel("Search categories").fill("groc");
    await expect(page.getByLabel("Energy")).toHaveCount(0);
    await page.getByLabel("Groceries").check();
    await step("Details").click();

    await expect(page.getByLabel("Paid from")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirm & Save" }),
    ).toBeEnabled();

    await step("Previous step").click();
    await step("Previous step").click();
    await expect(step("Category")).toBeEnabled();
  });

  test("transfers require a distinct target account", async ({ page }) => {
    await page.getByLabel("Transfer").check();
    await page.getByRole("button", { name: "Amount" }).click();
    await page.getByRole("button", { name: "5", exact: true }).click();
    await page.getByRole("button", { name: "Category" }).click();
    await page.getByLabel("Groceries").check();
    await page.getByRole("button", { name: "Details" }).click();
    await expect(
      page.getByRole("button", { name: "Confirm & Save" }),
    ).toBeDisabled();
    await page.getByLabel("To", { exact: true }).selectOption({ index: 1 });
    await expect(
      page.getByRole("button", { name: "Confirm & Save" }),
    ).toBeEnabled();
  });
});

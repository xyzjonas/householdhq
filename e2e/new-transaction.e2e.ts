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
    // Picking a type moves on to the amount stage.
    await page.getByLabel("Expense").check();
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

    // Enter on the keyboard moves on to the category stage.
    await page.keyboard.press("Enter");
    await expect(step("Details")).toBeDisabled();
    await page.getByLabel("Search categories").fill("groc");
    await expect(page.getByLabel("Energy")).toHaveCount(0);
    // Picking a category moves on to the details stage.
    await page.getByLabel("Groceries").check();

    await expect(page.getByLabel("Paid from")).toBeVisible();
    await expect(page.getByLabel("Description / merchant")).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Confirm & Save" }),
    ).toBeEnabled();

    await step("Previous step").click();
    await step("Previous step").click();
    await expect(step("Category")).toBeEnabled();
  });

  test("transfers require a distinct target account", async ({ page }) => {
    await page.getByLabel("Transfer").check();
    await page.getByRole("button", { name: "5", exact: true }).click();
    await page.getByRole("button", { name: "Category" }).click();
    await page.getByLabel("Groceries").check();
    await expect(
      page.getByRole("button", { name: "Confirm & Save" }),
    ).toBeDisabled();
    await page.getByLabel("To", { exact: true }).selectOption({ index: 1 });
    await expect(
      page.getByRole("button", { name: "Confirm & Save" }),
    ).toBeEnabled();
  });

  test("itemizes a receipt into several transactions", async ({ page }) => {
    const key = (name: string) =>
      page.getByRole("button", { name, exact: true });
    const pick = (name: string) =>
      page
        .getByRole("group", { name: "Category" })
        .getByText(name, { exact: true })
        .click();
    const enter = async (digits: string[]) => {
      for (const d of digits) await key(d).click();
    };

    // The receipt itself: 1000.
    // Expense is preselected, so clicking is what moves on to the amount.
    await page.getByText("Money you spent", { exact: true }).click();
    await enter(["1", "0", "0", "0"]);
    await key("Category").click();
    await pick("Groceries");
    await page.getByRole("button", { name: "Save & Itemize" }).click();

    // Back on the amount stage with the receipt as the original.
    await expect(page).toHaveURL(/\/transactions\/new\?parent=\d+$/);
    await expect(
      page.getByRole("heading", { name: /Amount & calculator/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Receipt allocation" }),
    ).toContainText("Original");

    // An item can't swallow the whole original.
    await enter(["1", "0", "0", "0"]);
    await expect(key("Category")).toBeDisabled();
    for (let i = 0; i < 4; i++) {
      await key("Backspace (hold to clear)").click();
    }

    // Item #1: 400, itemize further.
    await enter(["4", "0", "0"]);
    await key("Category").click();
    await pick("Groceries");
    await page.getByRole("button", { name: "Save & Itemize" }).click();
    await expect(page).toHaveURL(/parent=\d+&items=\d+$/);
    const panel = page.getByRole("region", { name: "Receipt allocation" });
    await expect(panel).toContainText("Saved");
    await expect(panel).toContainText("600 Kč");

    // Item #2: 100, then finish back on the dashboard.
    await enter(["1", "0", "0"]);
    await key("Category").click();
    await pick("Groceries");
    await page.getByRole("button", { name: "Finish" }).click();
    await expect(page).toHaveURL("/");
  });
});

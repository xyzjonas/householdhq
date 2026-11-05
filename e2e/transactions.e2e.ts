import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("transactions", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Transactions" }).first().click();
    await expect(page).toHaveURL(/\/transactions$/);
  });

  test("lists every transaction with a result count", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Transactions", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Showing 1 to \d+ of \d+/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Salary" })).toBeVisible();
  });

  test("searches descriptions", async ({ page }) => {
    await page.getByRole("searchbox").fill("Salary");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/q=Salary/);
    await expect(page.getByRole("heading", { name: "Salary" })).toBeVisible();

    await page.getByRole("searchbox").fill("zzzz-no-match");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/q=zzzz-no-match/);
    await expect(
      page.getByText("No transactions match these filters."),
    ).toBeVisible();
  });

  test("filters by type and resets", async ({ page }) => {
    await page.getByText("Filters", { exact: false }).first().click();
    await page.getByLabel("Type").selectOption("received");
    await expect(page).toHaveURL(/flow=received/);
    await expect(page.getByText("1 active")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Salary" })).toBeVisible();

    await page.getByRole("link", { name: "Reset search and filters" }).click();
    await expect(page).toHaveURL(/\/transactions$/);
  });

  test("changes the page size", async ({ page }) => {
    await page.getByLabel("Per page").selectOption("25");
    await expect(page).toHaveURL(/size=25/);
  });
});

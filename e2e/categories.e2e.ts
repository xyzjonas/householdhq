import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("categories", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Categories" }).first().click();
    await expect(page).toHaveURL(/\/categories$/);
  });

  test("lists categories with this month's activity and no budgets", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Category rules & budget caps" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Categories" }).first(),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("heading", { name: "Burn concentration" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Unbudgeted" }),
    ).toBeVisible();
  });

  test("search narrows the directory", async ({ page }) => {
    await page
      .getByRole("searchbox", { name: "Search categories" })
      .fill("gro");
    await expect(page.getByText("Groceries").first()).toBeVisible();
    await expect(page.getByText("Energy")).toHaveCount(0);
  });

  test("switches month", async ({ page }) => {
    await page.getByRole("link", { name: /Previous month/ }).click();
    await expect(page).toHaveURL(/\/categories\?month=\d{4}-\d{2}$/);
  });
});

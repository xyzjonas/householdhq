import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("category detail", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/categories");
    await page.getByRole("link", { name: "Groceries" }).first().click();
    await expect(page).toHaveURL(/\/categories\/\d+$/);
  });

  test("shows monthly spend, history chart and entries", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Groceries", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Monthly spent" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Monthly spending/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Entries/ })).toBeVisible();
  });

  test("switches month and chart range", async ({ page }) => {
    await page.getByRole("link", { name: /Previous month/ }).click();
    await expect(page).toHaveURL(/month=\d{4}-\d{2}/);
    await page.getByRole("link", { name: "Since forever" }).click();
    await expect(page).toHaveURL(/range=all/);
    await expect(
      page.getByRole("link", { name: "Since forever" }),
    ).toHaveAttribute("aria-current", "true");
  });

  test("all-time toggle and search browse every entry", async ({ page }) => {
    await page.getByLabel("All time").check();
    await expect(page).toHaveURL(/all=1/);
    await page
      .getByRole("searchbox", { name: "Search entries" })
      .fill("zzzz-no-match");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/q=zzzz-no-match/);
    await expect(
      page.getByText("No entries match these filters."),
    ).toBeVisible();
  });

  test("edits the description via PATCH", async ({ page }) => {
    const patch = page.waitForResponse(
      (r) => r.request().method() === "PATCH" && r.ok(),
    );
    await page.getByRole("button", { name: "Edit description" }).click();
    await page.getByLabel("Description").fill("Weekly shop");
    await page.getByRole("button", { name: "Save description" }).click();
    await patch;
    await expect(
      page.getByText("Description changed to “Weekly shop”"),
    ).toBeVisible();

    await page.reload();
    await expect(page.getByText("Weekly shop").first()).toBeVisible();

    // clear again for repeatable runs
    await page.getByRole("button", { name: "Edit description" }).click();
    await page.getByLabel("Description").fill("");
    await page.getByRole("button", { name: "Save description" }).click();
    await expect(page.getByText("Description cleared")).toBeVisible();
  });
});

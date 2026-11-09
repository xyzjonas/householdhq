import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("tags", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("creates, renames and deletes a tag", async ({ page }) => {
    const name = `E2E tag ${Date.now()}`;
    await page.goto("/tags");
    await expect(
      page.getByRole("heading", { name: "Tags & cross-cutting labels" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "New tag" }).click();
    await page.getByLabel("Tag name").fill(name);
    await page.getByRole("button", { name: "Create tag" }).click();
    await expect(page).toHaveURL(/\/tags$/);

    await page.getByRole("searchbox", { name: "Search tags" }).fill(name);
    await page.getByRole("link", { name }).first().click();
    await expect(page).toHaveURL(/\/tags\/\d+$/);
    await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Entries/ })).toBeVisible();

    const renamed = `${name} renamed`;
    const patch = page.waitForResponse(
      (r) => r.request().method() === "PATCH" && r.ok(),
    );
    await page.getByRole("button", { name: "Edit tag name" }).click();
    await page.getByLabel("Tag name").fill(renamed);
    await page.getByRole("button", { name: "Save tag name" }).click();
    await patch;
    await expect(
      page.getByRole("heading", { name: renamed, level: 1 }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Delete tag" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page).toHaveURL(/\/tags$/);
    await expect(page.getByText(renamed)).toHaveCount(0);
  });

  test("tags a transaction and shows the tag on its row", async ({ page }) => {
    const tag = `e2e-${Date.now()}`;
    await page.goto("/transactions/new");
    await page.getByRole("button", { name: "Amount" }).click();
    await page.getByRole("button", { name: "5", exact: true }).click();
    await page.getByRole("button", { name: "Category" }).click();
    await page.getByLabel("Groceries").check();
    await page.getByRole("button", { name: "Details" }).click();
    await page.getByLabel("Description / merchant").fill(`Tagged ${tag}`);
    await page.getByRole("textbox", { name: "Tags" }).fill(tag);
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: `Remove tag ${tag}` }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm & Save" }).click();

    await page.goto("/transactions");
    await page.getByRole("link", { name: tag, exact: true }).first().click();
    await expect(page).toHaveURL(/\/tags\/\d+$/);
    await expect(page.getByText(`Tagged ${tag}`)).toBeVisible();
  });
});

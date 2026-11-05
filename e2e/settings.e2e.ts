import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("settings", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Settings" }).first().click();
    await expect(page).toHaveURL(/\/settings$/);
  });

  test("shows the settings page as the active nav item", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Settings", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Settings" }).first(),
    ).toHaveAttribute("aria-current", "page");
  });

  test("changes the default currency and persists it", async ({ page }) => {
    const select = page.getByLabel("Default currency");
    await select.selectOption("EUR");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toHaveText("Settings saved.");

    await page.reload();
    await expect(select).toHaveValue("EUR");

    // restore the default so other specs are unaffected
    await select.selectOption("CZK");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toHaveText("Settings saved.");
  });
});

import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("energy", () => {
  test("creates a meter, adds readings and deletes one", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Energy" }).first().click();
    await expect(page).toHaveURL(/\/energy$/);

    const name = `Meter ${Date.now()}`;
    await page.getByRole("button", { name: "New meter" }).click();
    await page.getByLabel("Meter name").fill(name);
    await page.getByLabel("Unit", { exact: true }).fill("kWh");
    await page.getByRole("button", { name: "Create meter" }).click();

    await expect(page).toHaveURL(/\/energy\/\d+$/);
    await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();

    for (const value of ["100", "130,5"]) {
      await page.getByRole("button", { name: "New reading" }).click();
      await page.getByLabel(/^Value/).fill(value);
      await page.getByRole("button", { name: "Add reading" }).click();
      await expect(page.getByText("Reading added").first()).toBeVisible();
    }
    await expect(page.getByText("130,5 kWh").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Monthly consumption" }),
    ).toBeVisible();
    await expect(page.getByText("Latest reading")).toBeVisible();

    await page.getByRole("link", { name: "Readings", exact: true }).click();
    await expect(page).toHaveURL(/view=readings/);
    await expect(page.getByRole("img", { name: /^Readings/ })).toBeVisible();

    await page
      .getByRole("button", { name: /^Delete reading from/ })
      .first()
      .click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText("Reading deleted")).toBeVisible();
  });
});

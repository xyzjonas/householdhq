import { expect, test } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`).

test.describe("account detail", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/accounts");
    await page.getByRole("link", { name: "Wallet" }).click();
    await expect(page).toHaveURL(/\/accounts\/\d+$/);
  });

  test("shows balance, trajectory and properties", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Wallet" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Active current balance" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Closing balance by month/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Entries/ })).toBeVisible();
  });

  test("edits the name in place and persists it", async ({ page }) => {
    await page.getByRole("button", { name: "Edit account name" }).click();
    await page.getByLabel("Account name").fill("Wallet (renamed)");
    await page.getByRole("button", { name: "Save account name" }).click();
    await expect(page.getByText("Wallet (renamed)").first()).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Wallet \(renamed\)/ }),
    ).toBeVisible();

    // restore for repeatable runs
    await page.getByRole("button", { name: "Edit account name" }).click();
    await page.getByLabel("Account name").fill("Wallet");
    await page.getByRole("button", { name: "Save account name" }).click();
    await expect(page.getByRole("heading", { name: "Wallet" })).toBeVisible();
  });

  test("toggles a flag via PATCH", async ({ page }) => {
    const toggle = page.getByRole("checkbox", { name: "Portfolio overview" });
    const before = await toggle.isChecked();
    const patch = page.waitForResponse(
      (r) => r.request().method() === "PATCH" && r.ok(),
    );
    await page.getByText("Portfolio overview", { exact: true }).click();
    await patch;
    await page.reload();
    expect(await toggle.isChecked()).toBe(!before);

    const restore = page.waitForResponse(
      (r) => r.request().method() === "PATCH" && r.ok(),
    );
    await page.getByText("Portfolio overview", { exact: true }).click();
    await restore;
  });

  test("rejects PATCH for unknown accounts", async ({ page }) => {
    const res = await page.request.patch("/api/accounts/999999", {
      data: { name: "x" },
    });
    expect(res.status()).toBe(404);
  });
});

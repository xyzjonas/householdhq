import { expect, type Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "password123";

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
}

/** Drives the add-record wizard (expense from the default account). */
export async function completeWizard(
  page: Page,
  { amount, description }: { amount: string; description: string },
) {
  await page.getByRole("button", { name: "Amount" }).click();
  for (const digit of amount) {
    await page.getByRole("button", { name: digit, exact: true }).click();
  }
  await page.getByRole("button", { name: "Category" }).click();
  await page.getByLabel("Groceries").check();
  await page.getByRole("button", { name: "Details" }).click();
  await page.getByLabel("Description / merchant").fill(description);
  await page.getByRole("button", { name: "Confirm & Save" }).click();
}

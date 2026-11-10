import { expect, type Browser, type Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "password123";

export async function login(
  page: Page,
  email = ADMIN_EMAIL,
  password = ADMIN_PASSWORD,
) {
  await page.goto("/login");
  // Submitting before the page hydrates posts the form natively and the
  // enhanced handling (redirect, error message) is lost.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
}

/** A user's row in the administration tables (once per household they are in). */
export const userRow = (page: Page, email: string) =>
  page.getByRole("row").filter({ hasText: email });

/**
 * Invites `email` from the administration page, into the household called
 * `household` (none when omitted), and returns the one-time invite link.
 */
export async function invite(
  page: Page,
  email: string,
  household?: string,
): Promise<string> {
  await page.goto("/admin");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Invite user", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email").fill(email);
  const select = dialog.getByLabel("Household");
  if (household) await select.selectOption({ label: household });
  else await select.selectOption({ label: "No household (assign later)" });
  await dialog.getByRole("button", { name: "Create invite" }).click();
  return await page.getByLabel(`Invite link for ${email}`).inputValue();
}

/** Opens an invite link in a fresh browser context and sets the password. */
export async function acceptInvite(
  browser: Browser,
  link: string,
  password: string,
) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  await page.goto(link);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("New password", { exact: true }).fill(password);
  await page.getByLabel("Confirm new password").fill(password);
  await page.getByRole("button", { name: "Set password & sign in" }).click();
  await expect(page).toHaveURL(/\/$|\/admin$|\/no-household$/);
  await context.close();
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

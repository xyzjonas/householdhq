import { expect, test, type Browser } from "@playwright/test";
import { invite, login, userRow } from "./helpers";

const email = `invitee-${Date.now()}@example.com`;
const newPassword = "a brand new password";

async function inviteLink(browser: Browser, address: string) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  await login(page);
  const link = await invite(page, address, "Home");
  await context.close();
  return link;
}

// A service worker claiming a fresh page reloads it, which would abort the
// form submissions these tests make right after loading.
test.use({ serviceWorkers: "block" });

test.describe("user management", () => {
  test.describe.configure({ mode: "serial" });

  let link = "";

  test("a superuser sees the administration and can invite someone", async ({
    page,
    browser,
  }) => {
    await login(page);
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", {
        name: "Administration",
      }),
    ).toBeVisible();

    link = await inviteLink(browser, email);
    expect(link).toContain("/invite#");

    await page.goto("/admin");
    await expect(userRow(page, email)).toBeVisible();
  });

  test("the invitee sets a password and lands signed in without the administration", async ({
    page,
    context,
  }) => {
    await page.goto(link);
    await expect(page.getByRole("heading", { name: "Welcome!" })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    await page.getByLabel("New password", { exact: true }).fill(newPassword);
    await page.getByLabel("Confirm new password").fill(newPassword);
    await page.getByRole("button", { name: "Set password & sign in" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect((await context.cookies()).some((c) => c.name === "session")).toBe(
      true,
    );

    // completely hidden from navigation, and not reachable by URL
    await expect(
      page.getByRole("link", { name: "Administration" }),
    ).toHaveCount(0);
    expect((await page.goto("/admin"))?.status()).toBe(404);

    // the one-time link no longer works
    await page.goto(link);
    await page
      .getByLabel("New password", { exact: true })
      .fill("another password");
    await page.getByLabel("Confirm new password").fill("another password");
    await page.getByRole("button", { name: "Set password & sign in" }).click();
    await expect(page.getByRole("alert")).toContainText("no longer valid");
  });

  test("a damaged invite link is rejected", async ({ page }) => {
    await page.goto("/invite#not-a-token");
    await expect(
      page.getByRole("heading", { name: "Invalid invite link" }),
    ).toBeVisible();
  });

  test("a superuser can change the password and delete the account", async ({
    page,
    browser,
  }) => {
    await login(page);
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const row = userRow(page, email);

    await row.getByRole("button", { name: /Set password/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("New password").fill("reset by the admin");
    await dialog.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByText(`Password changed for ${email}`)).toBeVisible();

    // the new password works
    const other = await browser.newContext({ serviceWorkers: "block" });
    const otherPage = await other.newPage();
    await otherPage.goto("/login");
    await otherPage.getByLabel("Email").fill(email);
    await otherPage.getByLabel("Password").fill("reset by the admin");
    await otherPage.getByRole("button", { name: "Sign in" }).click();
    await expect(otherPage).toHaveURL(/\/$/);
    await other.close();

    await row.getByRole("button", { name: /Delete/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete user" })
      .click();
    await expect(row).toHaveCount(0);
  });
});

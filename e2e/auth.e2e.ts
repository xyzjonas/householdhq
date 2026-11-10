import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, login } from "./helpers";

test.describe("authentication", () => {
  test("redirects anonymous visitors to the login page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/transactions/new");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("setup page is not available once an admin exists", async ({ page }) => {
    await page.goto("/setup");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("rejects wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle"); // hydrated: the error shows inline
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill("definitely wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toHaveText(
      "Invalid email or password",
    );
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs in with an httpOnly session cookie and signs out", async ({
    page,
    context,
  }) => {
    await login(page);
    const cookie = (await context.cookies()).find((c) => c.name === "session");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");

    // already signed in: login redirects home
    await page.goto("/login");
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole("button", { name: "Sign out" }).first().click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await context.cookies()).find((c) => c.name === "session")).toBe(
      undefined,
    );

    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });
});

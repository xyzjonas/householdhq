import { expect, test, type Page } from "@playwright/test";
import { acceptInvite, invite, login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`):
// the seeded admin's household holds "Wallet", "Global ETFs", "Groceries", ...

const run = Date.now();
const neighbourEmail = `neighbour-${run}@example.com`;
const neighbourPassword = "correct horse";
const neighbours = `Neighbours ${run}`;

// Sections can nest: the innermost match comes last in document order.
const section = (page: Page, heading: string) =>
  page
    .locator("section", {
      has: page.getByRole("heading", { name: heading, exact: true }),
    })
    .last();

test.describe.configure({ mode: "serial" });

test.describe("households", () => {
  test("an admin creates a household and invites a user into it", async ({
    page,
    browser,
  }) => {
    await login(page);
    await page.getByRole("link", { name: "Administration" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.waitForLoadState("networkidle");

    const create = section(page, "New household");
    await create.getByLabel("Name").fill(neighbours);
    await create.getByRole("button", { name: "Create household" }).click();
    await expect(create.getByRole("status")).toHaveText("Household created.");
    await expect(page.getByRole("heading", { name: neighbours })).toBeVisible();

    // The invite form offers every household; the invitee joins the chosen one.
    const link = await invite(page, neighbourEmail, neighbours);
    await acceptInvite(browser, link, neighbourPassword);

    await page.goto("/admin");
    await expect(
      page.getByRole("button", {
        name: `Remove ${neighbourEmail} from ${neighbours}`,
      }),
    ).toBeVisible();
  });

  test("an admin edits a household's name and look", async ({ page }) => {
    await login(page);
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const region = page.getByRole("region", { name: neighbours, exact: true });
    await region.getByRole("button", { name: `Edit ${neighbours}` }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Name").fill(`${neighbours} & co`);
    await dialog.getByLabel("Pick color").fill("#ff0000");
    await dialog.getByRole("button", { name: "Change icon" }).click();
    const picker = page.getByRole("dialog").filter({ hasText: "Choose icon" });
    await picker.getByRole("searchbox").fill("petrol");
    await picker.getByRole("button", { name: "Fuel" }).first().click();
    await dialog.getByRole("button", { name: "Save household" }).click();

    await expect(
      page.getByRole("heading", { name: `${neighbours} & co` }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: `${neighbours} & co` })
        .locator('[style*="#ff0000"]'),
    ).toHaveCount(1);

    // Back to the original name so the other tests find it.
    await page.getByRole("button", { name: `Edit ${neighbours} & co` }).click();
    await page.getByRole("dialog").getByLabel("Name").fill(neighbours);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Default" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Save household" })
      .click();
    await expect(
      page.getByRole("heading", { name: neighbours, exact: true }),
    ).toBeVisible();
  });

  test("a member sees none of another household's data", async ({
    browser,
    page,
  }) => {
    // The admin's household: find the id of one of its accounts.
    await login(page);
    await page.goto("/accounts");
    const wallet = await page
      .getByRole("link", { name: /Wallet/ })
      .first()
      .getAttribute("href");
    expect(wallet).toMatch(/\/accounts\/\d+$/);

    const neighbour = await (await browser.newContext()).newPage();
    await login(neighbour, neighbourEmail, neighbourPassword);

    // The household's name is the app's title (with the product name as a
    // quiet mark above it), and there is nothing to switch to.
    const main = neighbour.getByRole("complementary");
    await expect(main.getByText("Household HQ")).toBeVisible();
    await expect(main.getByRole("link", { name: neighbours })).toBeVisible();
    await expect(
      neighbour.getByRole("button", { name: "Switch household" }),
    ).toHaveCount(0);

    await neighbour.goto("/accounts");
    await expect(
      neighbour.getByRole("heading", { name: "Bank account" }),
    ).toBeVisible();
    await expect(
      neighbour.getByRole("heading", { name: "Wallet" }),
    ).toHaveCount(0);
    await expect(
      neighbour.getByRole("heading", { name: "Global ETFs" }),
    ).toHaveCount(0);

    await neighbour.goto("/categories");
    await expect(neighbour.getByText("Groceries")).toHaveCount(0);

    await neighbour.goto("/transactions");
    await expect(neighbour.getByText("Rohlik delivery")).toHaveCount(0);

    // Guessing another household's ids gets "not found", never its data.
    expect(
      (await neighbour.goto(`/accounts/${wallet!.split("/").pop()}`))?.status(),
    ).toBe(404);
    await expect(neighbour.getByText("Wallet")).toHaveCount(0);
    expect((await neighbour.goto("/categories/1"))?.status()).toBe(404);
    expect((await neighbour.goto("/transactions/1/edit"))?.status()).toBe(404);
    expect((await neighbour.goto("/vehicles/1"))?.status()).toBe(404);
    expect((await neighbour.goto("/energy/1"))?.status()).toBe(404);

    // And it is no administrator.
    expect((await neighbour.goto("/admin"))?.status()).toBe(404);
    await expect(
      neighbour.getByRole("link", { name: "Administration" }),
    ).toHaveCount(0);

    await neighbour.context().close();
  });

  test("a user in two households can switch between them", async ({
    browser,
    page,
  }) => {
    await login(page);
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const home = page.getByRole("region", { name: "Home", exact: true });
    await home.getByLabel("Add an existing user to Home").selectOption({
      label: neighbourEmail,
    });
    await home.getByRole("button", { name: "Add", exact: true }).click();
    await expect(
      page.getByRole("button", {
        name: `Remove ${neighbourEmail} from Home`,
      }),
    ).toBeVisible();

    const neighbour = await (await browser.newContext()).newPage();
    await login(neighbour, neighbourEmail, neighbourPassword);
    await expect(
      neighbour.getByRole("button", { name: "Switch household" }),
    ).toBeVisible();

    // Switching posts a form and reloads; wait for that to finish.
    const switchTo = async (name: string) => {
      const switched = neighbour.waitForResponse(
        (r) =>
          new URL(r.url()).pathname === "/household/switch" &&
          r.request().method() === "POST",
      );
      await neighbour.getByRole("button", { name: "Switch household" }).click();
      await neighbour
        .getByRole("dialog")
        .getByRole("button", { name: new RegExp(`^${name}`) })
        .click();
      await switched;
      await neighbour.waitForLoadState("networkidle");
    };
    const wallet = neighbour.getByRole("heading", { name: "Wallet" });

    // In the original household the admin's data is there ...
    await switchTo("Home");
    await neighbour.goto("/accounts");
    await expect(wallet).toBeVisible();

    // ... and gone again after switching back.
    await switchTo(neighbours);
    await neighbour.goto("/accounts");
    await expect(wallet).toHaveCount(0);

    // Removing the membership takes effect on the very next request.
    await switchTo("Home");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const remove = page.getByRole("button", {
      name: `Remove ${neighbourEmail} from Home`,
    });
    await remove.click();
    await expect(remove).toHaveCount(0);
    await neighbour.goto("/accounts");
    await expect(wallet).toHaveCount(0);

    await neighbour.context().close();
  });
});

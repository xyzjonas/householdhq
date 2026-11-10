import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` (see `just e2e`):
// the seeded admin's household holds "Wallet", "Global ETFs", "Groceries", ...

const run = Date.now();
const neighbourEmail = `neighbour-${run}@example.com`;
const neighbourPassword = "correct horse";
const neighbours = `Neighbours ${run}`;

// Sections nest (the forms sit inside the "Households" / "Users" ones): the
// innermost match comes last in document order.
const section = (page: Page, heading: string) =>
  page
    .locator("section", {
      has: page.getByRole("heading", { name: heading, exact: true }),
    })
    .last();

test.describe.configure({ mode: "serial" });

test.describe("households", () => {
  test("an admin creates a household and a user in it", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Administration" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const create = section(page, "New household");
    await create.getByLabel("Name").fill(neighbours);
    await create.getByRole("button", { name: "Create household" }).click();
    await expect(create.getByRole("status")).toHaveText("Household created.");
    await expect(page.getByRole("heading", { name: neighbours })).toBeVisible();

    const user = section(page, "New user");
    await user.getByLabel("Email").fill(neighbourEmail);
    await user.getByLabel("Password").fill(neighbourPassword);
    await user.getByLabel("Household").selectOption({ label: neighbours });
    await user.getByRole("button", { name: "Create user" }).click();
    await expect(user.getByRole("status")).toHaveText("User created.");
    await expect(
      page.getByRole("article", { name: neighbours }).getByText(neighbourEmail),
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

    // Only the household's own name, and no way to switch.
    await expect(neighbour.getByText(neighbours).first()).toBeVisible();
    await expect(neighbour.getByLabel("Household")).toHaveCount(0);

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
    const home = page.getByRole("article").filter({
      hasNot: page.getByRole("heading", { name: neighbours }),
    });
    await home.first().getByLabel("Add a user").selectOption({
      label: neighbourEmail,
    });
    await home.first().getByRole("button", { name: "Add" }).click();
    await expect(home.first().getByText(neighbourEmail)).toBeVisible();

    const neighbour = await (await browser.newContext()).newPage();
    await login(neighbour, neighbourEmail, neighbourPassword);
    await expect(neighbour.getByLabel("Household").first()).toBeVisible();

    // Switching posts a form and reloads; wait for that to finish.
    const switchTo = async (name: string) => {
      const switched = neighbour.waitForResponse(
        (r) =>
          new URL(r.url()).pathname === "/household/switch" &&
          r.request().method() === "POST",
      );
      await neighbour
        .getByLabel("Household")
        .first()
        .selectOption({ label: name });
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
    await page
      .getByRole("article", { name: "Home" })
      .getByRole("button", { name: `Remove ${neighbourEmail} from Home` })
      .click();
    await expect(
      page
        .getByRole("article", { name: "Home" })
        .getByRole("button", { name: `Remove ${neighbourEmail} from Home` }),
    ).toHaveCount(0);
    await neighbour.goto("/accounts");
    await expect(wallet).toHaveCount(0);

    await neighbour.context().close();
  });
});

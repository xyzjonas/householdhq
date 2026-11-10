import { fail } from "@sveltejs/kit";
import { hq } from "#lib/server/index.ts";
import { ConflictError, NotFoundError } from "#lib/server/core/index.ts";
import { SettingsInput } from "#lib/server/core/schemas.ts";
import { currencies } from "#lib/components/transaction-wizard/types.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const core = hq(locals);
  const [settings, categories, accounts] = await Promise.all([
    core.settings.get(),
    core.categories.list(),
    core.accounts.list(),
  ]);
  return {
    settings,
    currencies,
    categories: categories.map(({ id, name }) => ({ id, name })),
    outAccounts: accounts
      .filter((a) => a.isOut)
      .map(({ id, name }) => ({ id, name })),
  };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    const currency = String((await request.formData()).get("currency") ?? "");
    if (!(currencies as string[]).includes(currency)) {
      return fail(400, { message: "Please choose a supported currency." });
    }
    await hq(locals).settings.update({ currency });
    return { saved: true };
  },

  interval: async ({ request, locals }) => {
    const parsed = SettingsInput.pick({
      fiscalIntervalStartDay: true,
    }).safeParse({
      fiscalIntervalStartDay: (await request.formData()).get(
        "fiscalIntervalStartDay",
      ),
    });
    if (!parsed.success) {
      return fail(400, {
        intervalMessage:
          parsed.error.issues[0]?.message ?? "Please enter a day from 1 to 31.",
      });
    }
    await hq(locals).settings.update(parsed.data);
    return { intervalSaved: true };
  },

  manko: async ({ request, locals }) => {
    const parsed = SettingsInput.pick({ mankoCategoryId: true }).safeParse({
      mankoCategoryId: (await request.formData()).get("mankoCategoryId"),
    });
    if (!parsed.success) {
      return fail(400, {
        mankoMessage:
          parsed.error.issues[0]?.message ?? "Please choose a category.",
      });
    }
    try {
      await hq(locals).settings.update(parsed.data);
    } catch (e) {
      if (e instanceof NotFoundError) {
        return fail(400, { mankoMessage: "That category no longer exists." });
      }
      throw e;
    }
    return { mankoSaved: true };
  },

  defaultOut: async ({ request, locals }) => {
    const parsed = SettingsInput.pick({ defaultOutAccountId: true }).safeParse({
      defaultOutAccountId: (await request.formData()).get(
        "defaultOutAccountId",
      ),
    });
    if (!parsed.success) {
      return fail(400, {
        defaultOutMessage:
          parsed.error.issues[0]?.message ?? "Please choose an account.",
      });
    }
    try {
      await hq(locals).settings.update(parsed.data);
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof ConflictError) {
        return fail(400, { defaultOutMessage: e.message });
      }
      throw e;
    }
    return { defaultOutSaved: true };
  },
};

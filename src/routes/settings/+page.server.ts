import { fail } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
import { SettingsInput } from "#lib/server/core/schemas.ts";
import { currencies } from "#lib/components/transaction-wizard/types.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({
  settings: await getCore().settings.get(),
  currencies,
});

export const actions: Actions = {
  update: async ({ request }) => {
    const currency = String((await request.formData()).get("currency") ?? "");
    if (!(currencies as string[]).includes(currency)) {
      return fail(400, { message: "Please choose a supported currency." });
    }
    await getCore().settings.update({ currency });
    return { saved: true };
  },

  interval: async ({ request }) => {
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
    await getCore().settings.update(parsed.data);
    return { intervalSaved: true };
  },
};

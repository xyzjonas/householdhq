import { fail } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
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
};

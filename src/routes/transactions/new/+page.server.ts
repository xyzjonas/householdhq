import { redirect } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
import {
  loadWizardData,
  parseTransactionForm,
} from "#lib/server/transaction-form.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = loadWizardData;

export const actions: Actions = {
  default: async ({ request }) => {
    const input = await parseTransactionForm(request);
    if ("status" in input) return input;
    await getCore().transactions.create(input);
    redirect(303, "/");
  },
};

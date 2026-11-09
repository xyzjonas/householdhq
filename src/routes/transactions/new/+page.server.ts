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
    const { next } = await getCore().transactions.createScheduled(input);
    // The client toasts the outcome, then navigates home.
    return { created: true, nextAt: next?.transactedAt?.toISOString() ?? null };
  },
};

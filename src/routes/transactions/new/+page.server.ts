import { fail, redirect } from "@sveltejs/kit";
import { m } from "#paraglide/messages.js";
import type { HouseholdCore } from "#lib/server/core/index.ts";
import { hq } from "#lib/server/index.ts";
import {
  loadItemize,
  loadWizardData,
  parseItemizeRefs,
  itemizeUrl,
  parseTransactionForm,
  wantsItemize,
} from "#lib/server/transaction-form.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const core = hq(locals);
  const [wizard, itemize] = await Promise.all([
    loadWizardData(core),
    loadItemize(
      core,
      url.searchParams.get("parent"),
      url.searchParams.get("items"),
    ),
  ]);
  return { ...wizard, itemize };
};

const cents = (n: number) => Math.round(n * 100) / 100;

/**
 * Persists the posted transaction. While itemizing, it is an item split off
 * the parent transaction, so the parent shrinks by the same amount.
 */
async function persist(core: HouseholdCore, request: Request) {
  const refs = parseItemizeRefs(
    ...(await request
      .clone()
      .formData()
      .then((f) => [f.get("parent"), f.get("items")] as const)),
  );
  const input = await parseTransactionForm(core, request);
  if ("status" in input) return input;
  const { transactions } = core;

  if (refs.parentId === null) {
    const { transaction, next } = await transactions.createScheduled(input);
    return { id: transaction.id, itemIds: [], next };
  }

  const parent = await loadItemize(core, String(refs.parentId), null);
  if (!parent) return fail(400, { errors: [m.wizard_error_original_gone()] });
  const left = parent.parent.amount;
  if (input.currency !== parent.parent.currency) {
    return fail(400, { errors: [m.wizard_error_currency_mismatch()] });
  }
  if (input.amount >= left) {
    return fail(400, {
      errors: [m.wizard_error_leave_something()],
    });
  }
  const item = await transactions.create({ ...input, recurring: 0 });
  try {
    await transactions.update(refs.parentId, {
      amount: cents(left - input.amount),
    });
  } catch (e) {
    // Don't leave the item behind without the parent paying for it.
    await transactions.remove(item.id);
    throw e;
  }
  return {
    id: refs.parentId,
    itemIds: [...refs.itemIds, item.id],
    next: null,
  };
}

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const itemize = await wantsItemize(request);
    const saved = await persist(hq(locals), request);
    if ("status" in saved) return saved;
    // Loop back to the amount stage to split off another item.
    if (itemize) redirect(303, itemizeUrl(saved.id, saved.itemIds));
    // The client toasts the outcome, then navigates home.
    return {
      created: true,
      nextAt: saved.next?.transactedAt?.toISOString() ?? null,
    };
  },
};

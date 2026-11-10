import { error, redirect } from "@sveltejs/kit";
import { m } from "#paraglide/messages.js";
import { ConflictError, NotFoundError } from "#lib/server/core/index.ts";
import { hq } from "#lib/server/index.ts";
import {
  itemizeUrl,
  loadWizardData,
  parseTransactionForm,
  wantsItemize,
} from "#lib/server/transaction-form.ts";
import type {
  Currency,
  TransactionType,
} from "#lib/components/transaction-wizard/types.ts";
import type { Actions, PageServerLoad } from "./$types";

const parseId = (raw: string) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) error(404, m.wizard_error_not_found());
  return id;
};

export const load: PageServerLoad = async ({ params, locals }) => {
  const id = parseId(params.id);
  const core = hq(locals);
  const [wizard, tx] = await Promise.all([
    loadWizardData(core),
    core.transactions.get(id).catch((e: unknown) => {
      if (e instanceof NotFoundError) error(404, m.wizard_error_not_found());
      throw e;
    }),
  ]);

  const type: TransactionType = tx.isHidden
    ? "HIDDEN"
    : tx.source.isOut
      ? "INCOME"
      : tx.target.isOut
        ? "EXPENSE"
        : "TRANSFER";
  return {
    ...wizard,
    transaction: {
      type,
      amount: tx.amount,
      currency: tx.currency as Currency,
      categoryId: tx.categoryId,
      // The wizard's "account" is the owned side of the transaction.
      accountId: tx.source.isOut ? tx.targetId : tx.sourceId,
      targetId: type === "INCOME" ? null : tx.targetId,
      description: tx.description === "N/A" ? "" : tx.description,
      transactedAt: (tx.transactedAt ?? tx.created).toISOString(),
      recurring: tx.recurring,
      hidden: tx.isHidden,
      important: tx.isImportant,
      tags: tx.tags.map((t) => t.name),
    },
  };
};

export const actions: Actions = {
  update: async ({ request, params, locals }) => {
    const id = parseId(params.id);
    const itemize = await wantsItemize(request);
    const core = hq(locals);
    const input = await parseTransactionForm(core, request);
    if ("status" in input) return input;
    try {
      await core.transactions.update(id, {
        ...input,
        description: input.description ?? "N/A",
      });
    } catch (e) {
      if (e instanceof NotFoundError) error(404, m.wizard_error_not_found());
      throw e;
    }
    // The edited transaction becomes the receipt's original.
    redirect(303, itemize ? itemizeUrl(id, []) : "/");
  },
  confirm: async ({ params, locals }) => {
    try {
      const confirmed = await hq(locals).transactions.confirm(
        parseId(params.id),
      );
      return { scheduledNext: confirmed.recurring > 0 };
    } catch (e) {
      if (e instanceof NotFoundError) error(404, m.wizard_error_not_found());
      if (e instanceof ConflictError) error(409, e.message);
      throw e;
    }
  },
  delete: async ({ params, locals }) => {
    try {
      await hq(locals).transactions.remove(parseId(params.id));
    } catch (e) {
      if (e instanceof NotFoundError) error(404, m.wizard_error_not_found());
      if (e instanceof ConflictError) error(409, e.message);
      throw e;
    }
    redirect(303, "/");
  },
};

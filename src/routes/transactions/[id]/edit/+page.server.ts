import { error, redirect } from "@sveltejs/kit";
import { ConflictError, NotFoundError } from "#lib/server/core/index.ts";
import { getCore } from "#lib/server/index.ts";
import {
  loadWizardData,
  parseTransactionForm,
} from "#lib/server/transaction-form.ts";
import type {
  Currency,
  TransactionType,
} from "#lib/components/transaction-wizard/types.ts";
import type { Actions, PageServerLoad } from "./$types";

const parseId = (raw: string) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) error(404, "Transaction not found");
  return id;
};

export const load: PageServerLoad = async ({ params }) => {
  const id = parseId(params.id);
  const [wizard, tx] = await Promise.all([
    loadWizardData(),
    getCore()
      .transactions.get(id)
      .catch((e: unknown) => {
        if (e instanceof NotFoundError) error(404, "Transaction not found");
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
    },
  };
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const id = parseId(params.id);
    const input = await parseTransactionForm(request);
    if ("status" in input) return input;
    try {
      await getCore().transactions.update(id, {
        ...input,
        description: input.description ?? "N/A",
      });
    } catch (e) {
      if (e instanceof NotFoundError) error(404, "Transaction not found");
      throw e;
    }
    redirect(303, "/");
  },
  confirm: async ({ params }) => {
    try {
      const confirmed = await getCore().transactions.confirm(
        parseId(params.id),
      );
      return { scheduledNext: confirmed.recurring > 0 };
    } catch (e) {
      if (e instanceof NotFoundError) error(404, "Transaction not found");
      if (e instanceof ConflictError) error(409, e.message);
      throw e;
    }
  },
  delete: async ({ params }) => {
    try {
      await getCore().transactions.remove(parseId(params.id));
    } catch (e) {
      if (e instanceof NotFoundError) error(404, "Transaction not found");
      if (e instanceof ConflictError) error(409, e.message);
      throw e;
    }
    redirect(303, "/");
  },
};

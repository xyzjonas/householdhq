import type { CreateUpdateTransaction, Transaction } from "./types";

export function transactionToUpdateTransaction(trans: Transaction): CreateUpdateTransaction {
  return {
    id: trans.id,
    created: trans.created.toUTCString(),
    description: trans.description,
    amount: trans.amount,
    currency: trans.currency,
    cancelled: trans.cancelled,
    confirmed: trans.confirmed,
    recurring: trans.recurring,
    categoryId: trans.category?.id,
    sourceId: trans.source.id,
    targetId: trans.target.id,
    tags: trans.tags.map((tag) => tag.name).join(","),
  };
}

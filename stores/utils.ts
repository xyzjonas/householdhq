import type { CreateUpdateTransaction, Transaction } from "~/types";

export function transactionToUpdateTransaction(trans: Transaction): CreateUpdateTransaction {
  let transactedAt;
  if (typeof trans.transactedAt === 'string') {
    transactedAt = trans.transactedAt;
  } else {
    transactedAt = trans.transactedAt.toUTCString();
  }
  return {
    id: trans.id,
    transactedAt,
    description: trans.description,
    amount: trans.amount,
    currency: trans.currency,
    cancelled: trans.cancelled,
    confirmed: trans.confirmed,
    recurring: trans.recurring,
    categoryId: trans.category?.id,
    sourceId: trans.source.id,
    targetId: trans.target.id,
    isImportant: trans.isImportant,
    isHidden: trans.isHidden,
    tags: trans.tags.map((tag) => tag.name).join(","),
  };
}

export function byDate(a: Transaction, b: Transaction): number {
  return new Date(b.transactedAt).getTime() - new Date(a.transactedAt).getTime()
}
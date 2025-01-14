import type { Source, Transaction } from "~/types";

export function isSummary(source: Source) {
  return !source.isOut || source.isDisponible;
}

export function isExpense(transaction: Transaction) {
  return !transaction.source.isOut
}

export function isIncome(transaction: Transaction) {
  return !isExpense(transaction);
}

export function getIncomeSum(transactions: Transaction[]) {
  return transactions
    .filter(isIncome)
    .filter((trans) => !trans.isHidden)
    .map((t) => t.amount)
    .reduce((a, b) => a + b, 0);
}

export function getExpenseSum(transactions: Transaction[]) {
  return transactions
    .filter(isExpense)
    .filter((trans) => !trans.isHidden)
    .map((t) => t.amount)
    .reduce((a, b) => a + b, 0);
}

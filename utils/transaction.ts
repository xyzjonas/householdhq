import type { Source, Transaction } from "~/types";

export function isSummary(source: Source) {
  return !source.isOut || source.isDisponible
}

export function isExpense(transaction: Transaction) {
  const isNormalExpense = !transaction.source.isOut && transaction.target.isOut;
  const isInternalTransfer = !transaction.source.isOut && transaction.target.isPortfolio;
  return isNormalExpense || isInternalTransfer;
}

export function isIncome(transaction: Transaction) {
  // const isInternal = !transaction.source.isOut && !transaction.target.isOut;
  return !isExpense(transaction)
}

export function getIncomeSum(transactions: Transaction[]) {
  return transactions.filter(isIncome).map(t => t.amount).reduce((a, b) => a + b, 0)
}

export function getExpenseSum(transactions: Transaction[]) {
  return transactions.filter(isExpense).map(t => t.amount).reduce((a, b) => a + b, 0)
}
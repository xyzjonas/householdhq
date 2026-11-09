export type TransactionType = "EXPENSE" | "INCOME" | "TRANSFER" | "HIDDEN";
export type Currency = "CZK" | "EUR" | "USD";

/** Expenses and hidden transactions are paid to an external account. */
export const isExpenseLike = (type: TransactionType) =>
  type === "EXPENSE" || type === "HIDDEN";

export const currencies: Currency[] = ["CZK", "EUR", "USD"];

export interface WizardAccount {
  id: number;
  name: string;
  isOut: boolean;
  balance: number;
}

/** Values used to pre-populate the wizard when editing a transaction. */
export interface WizardInitial {
  type: TransactionType;
  amount: number;
  currency: Currency;
  categoryId: number | null;
  accountId: number;
  targetId: number | null;
  description: string;
  /** ISO timestamp. */
  transactedAt: string;
  /** Repeat every n months; 0 when not recurring. */
  recurring: number;
  hidden: boolean;
  important: boolean;
  /** Names of the tags on the transaction. */
  tags: string[];
}

/** An existing tag offered by the tag picker. */
export interface WizardTag {
  name: string;
  color: string | null;
}

export interface WizardCategory {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
}

/**
 * Tailwind needs complete class names at build time, hence the spelled out
 * strings per transaction type (Apex Neo-Fintech accent tokens).
 */
export const transactionTypes: {
  value: TransactionType;
  label: string;
  hint: string;
  dot: string;
  active: string;
}[] = [
  {
    value: "EXPENSE",
    label: "Expense",
    hint: "Money you spent",
    dot: "bg-[#ef4444]",
    active:
      "border-[#ef4444] bg-[#fef2f2] text-[#991b1b] dark:bg-red-950/50 dark:text-red-200",
  },
  {
    value: "INCOME",
    label: "Income",
    hint: "Money you received",
    dot: "bg-[#10b981]",
    active:
      "border-[#10b981] bg-[#ecfdf5] text-[#065f46] dark:bg-emerald-950/50 dark:text-emerald-200",
  },
  {
    value: "TRANSFER",
    label: "Transfer",
    hint: "Between your accounts",
    dot: "bg-[#3b82f6]",
    active:
      "border-[#3b82f6] bg-[#eff6ff] text-[#1e40af] dark:bg-blue-950/50 dark:text-blue-200",
  },
  {
    value: "HIDDEN",
    label: "Hidden",
    hint: "Kept out of dashboard totals",
    dot: "bg-[#64748b]",
    active:
      "border-[#64748b] bg-[#f8fafc] text-[#334155] dark:bg-slate-800 dark:text-slate-200",
  },
];

export const stages = [
  { title: "Type of transaction", next: "Amount" },
  { title: "Amount & calculator", next: "Category" },
  { title: "Category", next: "Details" },
  { title: "Summary", next: "Confirm & Save" },
] as const;

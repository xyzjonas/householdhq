import { m } from "#paraglide/messages.js";

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

/**
 * An itemization in progress: the receipt's original transaction (already
 * reduced by every item split off so far) and the items persisted so far.
 */
export interface ItemizeContext {
  parent: {
    id: number;
    /** What is left on the original transaction. */
    amount: number;
    currency: Currency;
    categoryId: number | null;
    accountId: number;
    targetId: number | null;
    description: string;
    /** ISO timestamp. */
    transactedAt: string;
    hidden: boolean;
  };
  items: {
    id: number;
    amount: number;
    description: string;
    categoryId: number | null;
  }[];
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
  dot: string;
  active: string;
}[] = [
  {
    value: "EXPENSE",
    dot: "bg-[#ef4444]",
    active:
      "border-[#ef4444] bg-[#fef2f2] text-[#991b1b] dark:bg-red-950/50 dark:text-red-200",
  },
  {
    value: "INCOME",
    dot: "bg-[#10b981]",
    active:
      "border-[#10b981] bg-[#ecfdf5] text-[#065f46] dark:bg-emerald-950/50 dark:text-emerald-200",
  },
  {
    value: "TRANSFER",
    dot: "bg-[#3b82f6]",
    active:
      "border-[#3b82f6] bg-[#eff6ff] text-[#1e40af] dark:bg-blue-950/50 dark:text-blue-200",
  },
  {
    value: "HIDDEN",
    dot: "bg-[#64748b]",
    active:
      "border-[#64748b] bg-[#f8fafc] text-[#334155] dark:bg-slate-800 dark:text-slate-200",
  },
];

/** The wizard's steps; their texts come from {@link stageTitle}/{@link stageNext}. */
export const stages = [
  { key: "type" },
  { key: "amount" },
  { key: "category" },
  { key: "summary" },
] as const;

/** Heading of the 1-based stage `n`. */
export function stageTitle(n: number): string {
  switch (n) {
    case 1:
      return m.wizard_stage_type_title();
    case 2:
      return m.wizard_stage_amount_title();
    case 3:
      return m.wizard_stage_category_title();
    default:
      return m.wizard_stage_summary_title();
  }
}

/** Label of the button leaving the 1-based stage `n`. */
export function stageNext(n: number): string {
  switch (n) {
    case 1:
      return m.wizard_stage_type_next();
    case 2:
      return m.wizard_stage_amount_next();
    case 3:
      return m.wizard_stage_category_next();
    default:
      return m.wizard_stage_summary_next();
  }
}

export function typeLabel(type: TransactionType): string {
  switch (type) {
    case "EXPENSE":
      return m.wizard_type_expense();
    case "INCOME":
      return m.wizard_type_income();
    case "TRANSFER":
      return m.wizard_type_transfer();
    case "HIDDEN":
      return m.wizard_type_hidden();
  }
}

export function typeHint(type: TransactionType): string {
  switch (type) {
    case "EXPENSE":
      return m.wizard_type_expense_hint();
    case "INCOME":
      return m.wizard_type_income_hint();
    case "TRANSFER":
      return m.wizard_type_transfer_hint();
    case "HIDDEN":
      return m.wizard_type_hidden_hint();
  }
}

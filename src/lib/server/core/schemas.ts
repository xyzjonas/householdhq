import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullish();

export const sourceTypes = [
  "OUT",
  "ACCOUNT",
  "CASH",
  "SAVINGS",
  "INVESTMENT",
  "DEBT",
] as const;

export const CategoryInput = z.object({
  name: z.string().trim().min(1),
  description: optionalText,
  icon: optionalText,
  color: optionalText,
});
export type CategoryInput = z.infer<typeof CategoryInput>;
export const CategoryPatch = CategoryInput.partial();
export type CategoryPatch = z.infer<typeof CategoryPatch>;

// Patch schemas are built from default-free shapes: zod's `.partial()` would
// keep `.default()` values and silently reset omitted fields on update.
const accountShape = {
  name: z.string().trim().min(1),
  type: z.enum(sourceTypes),
  color: optionalText,
  position: z.number().int(),
  isOut: z.boolean(),
  isDisponible: z.boolean(),
  isPortfolio: z.boolean(),
};
export const AccountInput = z.object({
  ...accountShape,
  type: accountShape.type.default("ACCOUNT"),
  position: accountShape.position.default(999),
  isOut: accountShape.isOut.default(false),
  isDisponible: accountShape.isDisponible.default(false),
  isPortfolio: accountShape.isPortfolio.default(false),
});
export type AccountInput = z.input<typeof AccountInput>;
export const AccountPatch = z.object(accountShape).partial();
export type AccountPatch = z.input<typeof AccountPatch>;

const transactionShape = {
  description: z.string().trim().min(1),
  amount: z.number(),
  currency: z.string().length(3),
  transactedAt: z.coerce.date(),
  sourceId: z.number().int(),
  targetId: z.number().int(),
  categoryId: z.number().int().nullable(),
  recurring: z.number().int().min(0),
  isImportant: z.boolean(),
  isHidden: z.boolean(),
  tags: z.array(z.string().trim().min(1)),
};
export const TransactionInput = z.object({
  ...transactionShape,
  description: transactionShape.description.default("N/A"),
  currency: transactionShape.currency.default("CZK"),
  transactedAt: transactionShape.transactedAt.optional(),
  categoryId: transactionShape.categoryId.nullish(),
  recurring: transactionShape.recurring.default(0),
  isImportant: transactionShape.isImportant.default(false),
  isHidden: transactionShape.isHidden.default(false),
  tags: transactionShape.tags.default([]),
});
export type TransactionInput = z.input<typeof TransactionInput>;
export const TransactionPatch = z.object(transactionShape).partial();
export type TransactionPatch = z.input<typeof TransactionPatch>;

export const TransactionFlow = z.enum(["spent", "received", "transfer"]);
export type TransactionFlow = z.infer<typeof TransactionFlow>;

export const TransactionStatus = z.enum(["completed", "pending", "cancelled"]);
export type TransactionStatus = z.infer<typeof TransactionStatus>;

export const TransactionSort = z.enum([
  "date-desc",
  "date-asc",
  "amount-desc",
  "amount-asc",
]);
export type TransactionSort = z.infer<typeof TransactionSort>;

export const TransactionFilter = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  categoryId: z.number().int().optional(),
  /** Only transactions without a category. */
  uncategorized: z.boolean().optional(),
  /** Either side of the transaction. */
  accountId: z.number().int().optional(),
  sourceId: z.number().int().optional(),
  targetId: z.number().int().optional(),
  flow: TransactionFlow.optional(),
  status: TransactionStatus.optional(),
  important: z.boolean().optional(),
  recurring: z.boolean().optional(),
  hidden: z.boolean().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  /** Tag name. */
  tag: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
  /** Defaults to newest first; a search without a sort ranks by relevance. */
  sort: TransactionSort.optional(),
  limit: z.number().int().min(1).max(500).default(50),
  offset: z.number().int().min(0).default(0),
});
export type TransactionFilter = z.input<typeof TransactionFilter>;

export const UserInput = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
});
export type UserInput = z.input<typeof UserInput>;

export const SettingsInput = z.object({
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter ISO 4217 code"),
});
export type SettingsInput = z.input<typeof SettingsInput>;
export const SettingsPatch = SettingsInput.partial();
export type SettingsPatch = z.input<typeof SettingsPatch>;

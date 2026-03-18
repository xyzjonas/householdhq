import z from "zod";
import { IdSchema } from "./base";

const coerceBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  return value;
};

const TagListSchema = z
  .union([z.array(z.string()), z.string()])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value;
    }

    return value.split(",");
  });

export const TransactionMonthSchema = z.object({
  month: z.coerce.number().int().optional(),
  year: z.coerce.number().int().optional(),
});

export const TransactionFiltersSchema = z.object({
  categoryId: z.coerce.number().int().optional(),
  important: z.preprocess(coerceBoolean, z.boolean()).optional(),
});

export const CreateTransactionSchema = z.object({
  transactedAt: z.coerce.date().optional(),
  description: z.string(),
  amount: z.coerce.number(),
  recurring: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  sourceId: z.coerce.number(),
  targetId: z.coerce.number(),
  projectId: z.coerce.number().optional(),
  currency: z.string().optional(),
  tags: TagListSchema.optional(),
  isImportant: z.boolean().optional(),
  isHidden: z.boolean().optional(),
});

export const EditTransactionSchema = IdSchema.extend({
  transactedAt: z.coerce.date().optional(),
  cancelled: z.boolean().optional(),
  confirmed: z.boolean().optional(),
  description: z.string().optional(),
  amount: z.coerce.number().optional(),
  recurring: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  sourceId: z.coerce.number().optional(),
  targetId: z.coerce.number().optional(),
  projectId: z.coerce.number().optional(),
  currency: z.string().optional(),
  tags: TagListSchema.optional(),
  isImportant: z.boolean().optional(),
  isHidden: z.boolean().optional(),
});

export const TagTransactionSchema = z.object({
  transactionId: z.coerce.number().int(),
  tags: TagListSchema,
});

export type TransactionMonthRequest = z.infer<typeof TransactionMonthSchema>;
export type TransactionFiltersRequest = z.infer<
  typeof TransactionFiltersSchema
>;
export type CreateTransactionRequest = z.infer<typeof CreateTransactionSchema>;
export type EditTransactionRequest = z.infer<typeof EditTransactionSchema>;
export type TagTransactionRequest = z.infer<typeof TagTransactionSchema>;

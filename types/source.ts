import z from "zod";
import { IdSchema } from "./base";

export const SourceTypeSchema = z.enum([
  "ACCOUNT",
  "OUT",
  "CASH",
  "SAVINGS",
  "INVESTMENT",
  "DEBT",
]);

export const CreateSourceSchema = z.object({
  name: z.string(),
  isOut: z.boolean().optional(),
  isDisponible: z.boolean().optional(),
  isPortfolio: z.boolean().optional(),
});

export const EditSourceSchema = IdSchema.extend({
  isOut: z.boolean().optional(),
  isDisponible: z.boolean().optional(),
  isPortfolio: z.boolean().optional(),
  name: z.string().optional(),
  color: z.string().optional(),
  position: z.coerce.number().int().optional(),
  type: SourceTypeSchema.optional(),
});

export const UpdateSourceStateSchema = z.object({
  sourceId: z.coerce.number().int(),
  amount: z.coerce.number(),
  created: z.coerce.date().optional(),
});

export type SourceTypeRequest = z.infer<typeof SourceTypeSchema>;
export type CreateSourceRequest = z.infer<typeof CreateSourceSchema>;
export type EditSourceRequest = z.infer<typeof EditSourceSchema>;
export type UpdateSourceStateRequest = z.infer<typeof UpdateSourceStateSchema>;

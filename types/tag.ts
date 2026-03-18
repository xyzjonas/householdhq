import z from "zod";
import { IdSchema } from "./base";

export const CreateTagSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.coerce.number().optional(),
});

export const EditTagSchema = IdSchema.extend({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.coerce.number().optional(),
});

export type CreateTagRequest = z.infer<typeof CreateTagSchema>;
export type EditTagRequest = z.infer<typeof EditTagSchema>;

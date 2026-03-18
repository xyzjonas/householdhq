import z from "zod";
import { IdSchema } from "./base";

export const CreateProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  estimate: z.coerce.number(),
});

export const EditProjectSchema = IdSchema.extend({
  name: z.string().optional(),
  description: z.string().optional(),
  estimate: z.coerce.number().optional(),
  isCompleted: z.boolean().optional(),
  color: z.string().optional(),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
export type EditProjectRequest = z.infer<typeof EditProjectSchema>;

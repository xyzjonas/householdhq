import z from "zod";
import { IdSchema } from "./base";

export const CreateCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.coerce.number().optional(),
});

export const CategorySchema = IdSchema.extend({
  name: z.string(),
  description: z.string().nullish(),
  icon: z.string().nullish(),
  color: z.string().nullish(),
  parentId: z.number().nullish(),
});

export const EditCategorySchema = IdSchema.extend({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.coerce.number().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export type CreateCategory = z.infer<typeof CreateCategorySchema>;

export type EditCategory = z.infer<typeof EditCategorySchema>;

import z from "zod";
import { IdSchema } from "./base";

export const CreateCategorySchema = z.object({
  name: z.string(),
});

export const CategorySchema = IdSchema.extend({
  name: z.string(),
  description: z.string().nullish(),
  icon: z.string().nullish(),
  color: z.string().nullish(),
});

export const EditCategorySchema = CategorySchema.extend({
  name: z.string().nullish(),
});

export type Category = z.infer<typeof CategorySchema>;

export type CreateCategory = z.infer<typeof CreateCategorySchema>;

export type EditCategory = z.infer<typeof EditCategorySchema>;

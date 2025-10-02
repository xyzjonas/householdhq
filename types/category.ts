import z from "zod";

export const CreateCategorySchema = z.object({
  name: z.string(),
});

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export type CreateCategory = z.infer<typeof CreateCategorySchema>;

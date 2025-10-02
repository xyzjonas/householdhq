import z from "zod";

export const IdSchema = z.object({
  id: z.coerce.number(),
});

export type IDBase = z.infer<typeof IdSchema>;

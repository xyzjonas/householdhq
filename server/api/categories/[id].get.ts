import { IdSchema } from "~/types";
import categories from "~~/server/controllers/categories";

export default defineEventHandler(async (event) => {
  const data = IdSchema.parse(event.context.params);
  const category = await categories.findSingle(data);
  return {
    data: category,
  };
});

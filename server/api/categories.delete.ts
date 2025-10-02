import { IdSchema } from "~/types";
import categories from "../controllers/categories";

export default defineEventHandler(async (event) => {
  const data = IdSchema.parse(await readBody(event));
  const response = await categories.deleteCategory(data);
  setResponseStatus(event, 200);
  return {
    data: response,
    message: "deleted",
  };
});

import { EditCategorySchema } from "~/types/category";
import categories from "../controllers/categories";

export default defineEventHandler(async (event) => {
  const data = EditCategorySchema.parse(await readBody(event));
  const response = await categories.editTag(data);
  setResponseStatus(event, 200);
  return {
    data: response,
    message: "updated",
  };
});

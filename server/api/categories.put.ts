import { CreateCategorySchema } from "~/types";
import categories from "../controllers/categories";

export default defineEventHandler(async (event) => {
  const data = CreateCategorySchema.parse(await readBody(event));
  const response = await categories.createCategory(data);
  setResponseStatus(event, 201);
  return {
    data: response,
    message: "created",
  };
});

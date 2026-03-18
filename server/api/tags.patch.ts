import tags from "~~/server/controllers/tags";
import doValidate from "~~/server/validators/validator";
import { EditTagSchema, type EditTagRequest } from "~~/types/tag";

export default defineEventHandler(async (event) => {
  const data: EditTagRequest = await doValidate(
    EditTagSchema,
    await readBody(event),
  );
  const response = await tags.editTag(data);
  setResponseStatus(event, 200);
  return {
    data: response,
    message: "updated",
  };
});

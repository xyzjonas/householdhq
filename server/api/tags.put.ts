import tags from "~~/server/controllers/tags";
import doValidate from "~~/server/validators/validator";
import { CreateTagSchema, type CreateTagRequest } from "~~/types/tag";

export default defineEventHandler(async (event) => {
  const data: CreateTagRequest = await doValidate(
    CreateTagSchema,
    await readBody(event),
  );
  const response = await tags.createTag(data);
  setResponseStatus(event, 201);
  return {
    data: response,
    message: "created",
  };
});

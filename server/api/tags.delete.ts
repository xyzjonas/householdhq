import tags from "~~/server/controllers/tags";
import doValidate from "~~/server/validators/validator";
import { IdSchema, type IDBase } from "~~/types/base";

export default defineEventHandler(async (event) => {
  const data: IDBase = await doValidate(IdSchema, await readBody(event));
  const response = await tags.deleteTag(data);
  setResponseStatus(event, 200);
  return {
    data: response,
    message: "deleted",
  };
});

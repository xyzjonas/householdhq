import tags from "~~/server/controllers/tags";
import { IdSchema, type IDBase } from "~~/types/base";
import doValidate from "~~/server/validators/validator";

export default defineEventHandler(async (event) => {
  const data: IDBase = await doValidate(IdSchema, event.context.params);
  const tag = await tags.findSingle(data);
  return {
    data: tag,
  };
});

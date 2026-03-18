import { IdSchema, type IDBase } from "~/types/base";
import sources from "../../controllers/sources";
import doValidate from "../../validators/validator";

export default defineEventHandler(async (event) => {
  const data: IDBase = await doValidate(IdSchema, await readBody(event));
  const deletedState = await sources.deleteState(data);
  setResponseStatus(event, 200);
  return {
    data: deletedState,
    message: "deleted",
  };
});

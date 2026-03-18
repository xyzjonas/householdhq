import { sources } from "@/server/controllers";
import { IdSchema, type IDBase } from "~/types/base";
import doValidate from "@/server/validators/validator";

export default defineEventHandler(async (event) => {
  const data: IDBase = await doValidate(IdSchema, event.context.params);

  const newState = await sources.autoInsertState(data);
  return { data: newState };
});

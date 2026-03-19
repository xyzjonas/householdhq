import meters from "~/server/controllers/meters";
import { IdSchema, type IDBase } from "~/types/base";
import doValidate from "~/server/validators/validator";

export default defineEventHandler(async (event) => {
  const data: IDBase = await doValidate(IdSchema, event.context.params);
  const meter = await meters.findSingleMeter(data);

  return {
    data: meter,
  };
});

import meters from "~/server/controllers/meters";
import doValidate from "~/server/validators/validator";
import {
  IdSchema,
  MeterUpdateSchema,
  type IDBase,
  type MeterUpdate,
} from "~/types";

export default defineEventHandler(async (event) => {
  const params: IDBase = await doValidate(IdSchema, event.context.params);
  const body: MeterUpdate = await doValidate(
    MeterUpdateSchema,
    await readBody(event),
  );
  const meter = await meters.editMeter(params.id, body);

  setResponseStatus(event, 200);
  return {
    data: meter,
    message: "updated",
  };
});

import vehicles from "~/server/controllers/vehicles";
import { IdSchema, type IDBase } from "~/types/base";
import doValidate from "~/server/validators/validator";

export default defineEventHandler(async (event) => {
  const data: IDBase = await doValidate(IdSchema, event.context.params);
  const vehicle = await vehicles.findSingleVehicle(data);

  return {
    data: vehicle,
  };
});

import vehicles from "~/server/controllers/vehicles";
import doValidate from "~/server/validators/validator";
import {
  IdSchema,
  VehicleUpdateSchema,
  type IDBase,
  type VehicleUpdate,
} from "~/types";

export default defineEventHandler(async (event) => {
  const params: IDBase = await doValidate(IdSchema, event.context.params);
  const body: VehicleUpdate = await doValidate(
    VehicleUpdateSchema,
    await readBody(event),
  );
  const vehicle = await vehicles.editVehicle(params.id, body);

  setResponseStatus(event, 200);
  return {
    data: vehicle,
    message: "updated",
  };
});

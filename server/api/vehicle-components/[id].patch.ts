import vehicleComponents from "~/server/controllers/vehicleComponents";
import doValidate from "~/server/validators/validator";
import {
  VehicleComponentIdSchema,
  VehicleComponentUpdateSchema,
  type VehicleComponentUpdate,
} from "~/types";

export default defineEventHandler(async (event) => {
  const { id } = await doValidate(
    VehicleComponentIdSchema,
    event.context.params,
  );

  const body: VehicleComponentUpdate = await doValidate(
    VehicleComponentUpdateSchema,
    await readBody(event),
  );

  return await vehicleComponents.edit(id, body);
});

import vehicleComponents from "~/server/controllers/vehicleComponents";
import doValidate from "~/server/validators/validator";
import {
  VehicleComponentCreateSchema,
  type VehicleComponentCreate,
} from "~/types";

export default defineEventHandler(async (event) => {
  const body: VehicleComponentCreate = await doValidate(
    VehicleComponentCreateSchema,
    await readBody(event),
  );

  return await vehicleComponents.create(body);
});

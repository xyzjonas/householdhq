import vehicleComponents from "~/server/controllers/vehicleComponents";
import doValidate from "~/server/validators/validator";
import { VehicleComponentIdSchema } from "~/types";

export default defineEventHandler(async (event) => {
  const { id } = await doValidate(
    VehicleComponentIdSchema,
    event.context.params,
  );

  return await vehicleComponents.delete(id);
});

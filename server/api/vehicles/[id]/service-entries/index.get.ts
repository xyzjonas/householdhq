import vehicleServiceEntries from "~/server/controllers/vehicleServiceEntries";
import doValidate from "~/server/validators/validator";
import { VehicleScopedParamsSchema, type VehicleScopedParams } from "~/types";

export default defineEventHandler(async (event) => {
  const params: VehicleScopedParams = await doValidate(
    VehicleScopedParamsSchema,
    event.context.params,
  );

  const data = await vehicleServiceEntries.findByVehicleId(params.id);

  return {
    data,
    count: data.length,
  };
});

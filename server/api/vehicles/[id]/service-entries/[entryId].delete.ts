import vehicleServiceEntries from "~/server/controllers/vehicleServiceEntries";
import doValidate from "~/server/validators/validator";
import { VehicleEntryParamsSchema, type VehicleEntryParams } from "~/types";

export default defineEventHandler(async (event) => {
  const params: VehicleEntryParams = await doValidate(
    VehicleEntryParamsSchema,
    event.context.params,
  );

  return await vehicleServiceEntries.delete(params.id, params.entryId);
});

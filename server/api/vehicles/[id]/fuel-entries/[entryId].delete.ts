import vehicleFuelEntries from "~/server/controllers/vehicleFuelEntries";
import doValidate from "~/server/validators/validator";
import { VehicleEntryParamsSchema, type VehicleEntryParams } from "~/types";

export default defineEventHandler(async (event) => {
  const params: VehicleEntryParams = await doValidate(
    VehicleEntryParamsSchema,
    event.context.params,
  );

  return await vehicleFuelEntries.delete(params.id, params.entryId);
});

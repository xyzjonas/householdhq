import vehicleFuelEntries from "~/server/controllers/vehicleFuelEntries";
import doValidate from "~/server/validators/validator";
import {
  VehicleEntryParamsSchema,
  VehicleFuelEntryUpdateSchema,
  type VehicleEntryParams,
  type VehicleFuelEntryUpdate,
} from "~/types";

export default defineEventHandler(async (event) => {
  const params: VehicleEntryParams = await doValidate(
    VehicleEntryParamsSchema,
    event.context.params,
  );

  const body: VehicleFuelEntryUpdate = await doValidate(
    VehicleFuelEntryUpdateSchema,
    await readBody(event),
  );

  return await vehicleFuelEntries.edit(params.id, params.entryId, body);
});

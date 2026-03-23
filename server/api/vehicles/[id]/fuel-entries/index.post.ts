import vehicleFuelEntries from "~/server/controllers/vehicleFuelEntries";
import doValidate from "~/server/validators/validator";
import {
  VehicleFuelEntryCreateSchema,
  VehicleScopedParamsSchema,
  type VehicleFuelEntryCreate,
  type VehicleScopedParams,
} from "~/types";

export default defineEventHandler(async (event) => {
  const params: VehicleScopedParams = await doValidate(
    VehicleScopedParamsSchema,
    event.context.params,
  );

  const body: VehicleFuelEntryCreate = await doValidate(
    VehicleFuelEntryCreateSchema,
    await readBody(event),
  );

  return await vehicleFuelEntries.create(params.id, body);
});

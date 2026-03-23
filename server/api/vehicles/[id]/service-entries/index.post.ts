import vehicleServiceEntries from "~/server/controllers/vehicleServiceEntries";
import doValidate from "~/server/validators/validator";
import {
  VehicleScopedParamsSchema,
  VehicleServiceEntryCreateSchema,
  type VehicleScopedParams,
  type VehicleServiceEntryCreate,
} from "~/types";

export default defineEventHandler(async (event) => {
  const params: VehicleScopedParams = await doValidate(
    VehicleScopedParamsSchema,
    event.context.params,
  );

  const body: VehicleServiceEntryCreate = await doValidate(
    VehicleServiceEntryCreateSchema,
    await readBody(event),
  );

  return await vehicleServiceEntries.create(params.id, body);
});

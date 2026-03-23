import vehicleServiceEntries from "~/server/controllers/vehicleServiceEntries";
import doValidate from "~/server/validators/validator";
import {
  VehicleEntryParamsSchema,
  VehicleServiceEntryUpdateSchema,
  type VehicleEntryParams,
  type VehicleServiceEntryUpdate,
} from "~/types";

export default defineEventHandler(async (event) => {
  const params: VehicleEntryParams = await doValidate(
    VehicleEntryParamsSchema,
    event.context.params,
  );

  const body: VehicleServiceEntryUpdate = await doValidate(
    VehicleServiceEntryUpdateSchema,
    await readBody(event),
  );

  return await vehicleServiceEntries.edit(params.id, params.entryId, body);
});

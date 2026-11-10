import { m } from "#paraglide/messages.js";
import type { VehicleServiceType } from "#lib/server/core/schemas.ts";

export const serviceTypeLabels: Record<VehicleServiceType, () => string> = {
  REGULAR_MAINTENANCE: () => m.vehicles_service_type_regular_maintenance(),
  DEFECT: () => m.vehicles_service_type_defect(),
  FEES: () => m.vehicles_service_type_fees(),
  UPGRADE: () => m.vehicles_service_type_upgrade(),
};

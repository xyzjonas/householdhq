import type { VehicleServiceType } from "#lib/server/core/schemas.ts";

export const serviceTypeLabels: Record<VehicleServiceType, string> = {
  REGULAR_MAINTENANCE: "Regular maintenance",
  DEFECT: "Defect",
  FEES: "Fees",
  UPGRADE: "Upgrade",
};

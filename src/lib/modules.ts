import { m } from "#paraglide/messages.js";

/** A part of the app a household can switch off in the navigation. */
export const MODULES = [
  {
    key: "accounting",
    label: () => m.modules_accounting_label(),
    description: () => m.modules_accounting_description(),
  },
  {
    key: "projects",
    label: () => m.modules_projects_label(),
    description: () => m.modules_projects_description(),
  },
  {
    key: "vehicles",
    label: () => m.modules_vehicles_label(),
    description: () => m.modules_vehicles_description(),
  },
  {
    key: "energy",
    label: () => m.modules_energy_label(),
    description: () => m.modules_energy_description(),
  },
] as const;

export type ModuleKey = (typeof MODULES)[number]["key"];

export const MODULE_KEYS: ModuleKey[] = MODULES.map((m) => m.key);

/**
 * Reads the stored comma-separated module list. Unknown names are dropped and
 * a household that has never chosen (null) has every module enabled.
 */
export function parseEnabledModules(stored: string | null): ModuleKey[] {
  if (stored === null) return [...MODULE_KEYS];
  const names = stored.split(",");
  return MODULE_KEYS.filter((key) => names.includes(key));
}

export function serializeEnabledModules(keys: readonly string[]): string {
  return MODULE_KEYS.filter((key) => keys.includes(key)).join(",");
}

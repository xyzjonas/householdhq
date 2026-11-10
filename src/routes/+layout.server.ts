import { MODULE_KEYS } from "#lib/modules.ts";
import type { Household } from "#lib/server/core/types.ts";
import type { LayoutServerLoad } from "./$types";

const summary = ({ id, name, icon, color }: Household) => ({
  id,
  name,
  icon,
  color,
});

export const load: LayoutServerLoad = async ({ locals }) => ({
  user: locals.user,
  /** Modules the household shows in its navigation (all without a household). */
  enabledModules: locals.hq
    ? await locals.hq.settings.enabledModules()
    : [...MODULE_KEYS],
  /** The household being worked in, and the others the user could switch to. */
  household: locals.household ? summary(locals.household) : null,
  households: locals.households.map(summary),
});

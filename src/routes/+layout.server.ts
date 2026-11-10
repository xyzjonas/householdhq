import type { Household } from "#lib/server/core/types.ts";
import type { LayoutServerLoad } from "./$types";

const summary = ({ id, name, icon, color }: Household) => ({
  id,
  name,
  icon,
  color,
});

export const load: LayoutServerLoad = ({ locals }) => ({
  user: locals.user,
  /** The household being worked in, and the others the user could switch to. */
  household: locals.household ? summary(locals.household) : null,
  households: locals.households.map(summary),
});

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals }) => ({
  user: locals.user,
  /** The household being worked in, and the others the user could switch to. */
  household: locals.household
    ? { id: locals.household.id, name: locals.household.name }
    : null,
  households: locals.households.map(({ id, name }) => ({ id, name })),
});

import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals }) => {
  // Nothing to wait for once the user belongs to a household.
  if (locals.household) redirect(303, "/");
};

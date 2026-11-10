import { error, redirect } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
import { SESSION_COOKIE } from "#lib/server/auth.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = () => redirect(303, "/");

export const actions: Actions = {
  /** Moves the session to another household the user belongs to. */
  default: async ({ request, cookies, locals }) => {
    const token = cookies.get(SESSION_COOKIE);
    const id = Number((await request.formData()).get("householdId"));
    // `locals.households` is the user's own memberships, loaded for this request.
    const target = locals.households.find((h) => h.id === id);
    if (!token || !locals.user || !target) error(404, "Household not found");
    await getCore().sessions.setHousehold(token, target.id);
    // Ids on the current page mean nothing in the other household.
    redirect(303, "/");
  },
};

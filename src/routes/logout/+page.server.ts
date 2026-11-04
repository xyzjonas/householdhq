import { redirect } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
import { SESSION_COOKIE, clearSessionCookie } from "#lib/server/auth.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = () => redirect(303, "/");

export const actions: Actions = {
  default: async ({ cookies }) => {
    const token = cookies.get(SESSION_COOKIE);
    if (token) await getCore().sessions.invalidate(token);
    clearSessionCookie(cookies);
    redirect(303, "/login");
  },
};

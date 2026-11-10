import { fail, redirect } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
import {
  clearFailures,
  isRateLimited,
  recordFailure,
  setSessionCookie,
} from "#lib/server/auth.ts";
import { m } from "#paraglide/messages.js";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, cookies, url, getClientAddress }) => {
    const form = await request.formData();
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") ?? "");

    const key = `${getClientAddress()}|${email}`;
    if (isRateLimited(key)) {
      return fail(429, {
        email,
        message: m.auth_too_many_attempts(),
      });
    }

    const core = getCore();
    const user = await core.users.authenticate(email, password);
    if (!user) {
      recordFailure(key);
      return fail(400, { email, message: m.auth_invalid_credentials() });
    }

    clearFailures(key);
    const { token, expiresAt } = await core.sessions.create(user.id);
    setSessionCookie(cookies, token, expiresAt, url.protocol === "https:");
    redirect(303, "/");
  },
};

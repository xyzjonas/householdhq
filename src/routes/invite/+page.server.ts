import { fail, redirect } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
import {
  clearFailures,
  isRateLimited,
  recordFailure,
  setSessionCookie,
} from "#lib/server/auth.ts";
import { UserInput } from "#lib/server/core/index.ts";
import { m } from "#paraglide/messages.js";
import type { Actions } from "./$types";

export const actions: Actions = {
  /**
   * Replaces the one-time password from the invite link. The current password
   * (taken from the link) authenticates the change, then the user is signed in.
   */
  default: async ({ request, cookies, url, getClientAddress }) => {
    const form = await request.formData();
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const current = String(form.get("current") ?? "");
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    const parsed = UserInput.shape.password.safeParse(password);
    if (!parsed.success) {
      return fail(400, { message: parsed.error.issues[0]?.message });
    }
    if (password !== confirm) {
      return fail(400, { message: m.auth_passwords_mismatch() });
    }
    if (password === current) {
      return fail(400, { message: m.invite_password_same() });
    }

    const key = `${getClientAddress()}|${email}`;
    if (isRateLimited(key)) {
      return fail(429, {
        message: m.auth_too_many_attempts(),
      });
    }

    const core = getCore();
    const user = await core.users.authenticate(email, current);
    if (!user) {
      recordFailure(key);
      return fail(400, {
        message: m.invite_link_no_longer_valid(),
      });
    }

    clearFailures(key);
    // Also signs out every other session of this account.
    await core.users.setPassword(user.id, password);
    const session = await core.sessions.create(user.id);
    setSessionCookie(
      cookies,
      session.token,
      session.expiresAt,
      url.protocol === "https:",
    );
    redirect(303, "/");
  },
};

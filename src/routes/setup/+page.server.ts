import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import { getCore } from "#lib/server/index.ts";
import {
  ConflictError,
  HouseholdInput,
  UserInput,
} from "#lib/server/core/index.ts";
import { setSessionCookie } from "#lib/server/auth.ts";
import { m } from "#paraglide/messages.js";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const form = await request.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    const household = String(form.get("household") ?? "");

    const parsed = UserInput.safeParse({ email, password });
    const parsedHousehold = HouseholdInput.safeParse({ name: household });
    if (!parsed.success || !parsedHousehold.success) {
      return fail(400, {
        email,
        household,
        errors: {
          ...(parsed.success ? {} : z.flattenError(parsed.error).fieldErrors),
          ...(parsedHousehold.success
            ? {}
            : {
                household: parsedHousehold.error.issues.map((i) => i.message),
              }),
        },
      });
    }
    if (password !== confirm) {
      return fail(400, {
        email,
        household,
        errors: { confirm: [m.auth_passwords_mismatch()] },
      });
    }

    const core = getCore();
    // Re-check: setup must only ever create the first user.
    if ((await core.users.count()) > 0) redirect(303, "/login");

    let user;
    try {
      user = await core.users.create(parsed.data, { isSuperuser: true });
    } catch (e) {
      if (e instanceof ConflictError) redirect(303, "/login");
      throw e;
    }
    // The first household, with the default accounts every household starts with.
    const created = await core.households.create(parsedHousehold.data);
    await core.households.addMember(created.id, user.id);

    const session = await core.sessions.create(user.id, created.id);
    setSessionCookie(
      cookies,
      session.token,
      session.expiresAt,
      url.protocol === "https:",
    );
    redirect(303, "/");
  },
};

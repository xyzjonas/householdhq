import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { getCore } from "#lib/server/index.ts";
import { setSessionCookie } from "#lib/server/auth.ts";
import { encodeInvite } from "#lib/invite.ts";
import {
  ConflictError,
  NotFoundError,
  UserInput,
} from "#lib/server/core/index.ts";
import type { Actions, PageServerLoad } from "./$types";

// Access is restricted to superusers in hooks.server.ts, for loads and actions.

export const load: PageServerLoad = async ({ locals }) => ({
  users: await getCore().users.list(),
  currentUserId: locals.user?.id,
});

const userId = (form: FormData) => Number(form.get("id"));

export const actions: Actions = {
  /** Creates the account with a random password and returns the invite link token. */
  invite: async ({ request, locals }) => {
    const email = String((await request.formData()).get("email") ?? "");
    const parsed = UserInput.shape.email.safeParse(email);
    if (!parsed.success) {
      return fail(400, { message: "Please enter a valid email address." });
    }
    try {
      const core = getCore();
      const { user, password } = await core.users.invite(parsed.data);
      // Whoever is invited from within a household joins it; more households
      // can be granted under /admin.
      if (locals.household) {
        await core.households.addMember(locals.household.id, user.id);
      }
      return {
        invite: {
          email: user.email,
          token: encodeInvite({ email: user.email, password }),
        },
      };
    } catch (e) {
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
  },

  /** Replaces the password with a fresh random one and returns a new link. */
  reinvite: async ({ request, locals }) => {
    const id = userId(await request.formData());
    if (id === locals.user?.id) {
      return fail(400, { message: "Use a new password for your own account." });
    }
    try {
      const { user, password } = await getCore().users.reissueInvite(id);
      return {
        invite: {
          email: user.email,
          token: encodeInvite({ email: user.email, password }),
        },
      };
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
  },

  setPassword: async ({ request, locals, cookies, url }) => {
    const form = await request.formData();
    const id = userId(form);
    const parsed = UserInput.shape.password.safeParse(form.get("password"));
    if (!parsed.success) {
      return fail(400, { message: z.prettifyError(parsed.error) });
    }
    const core = getCore();
    try {
      const user = await core.users.setPassword(id, parsed.data);
      if (user.id === locals.user?.id) {
        // Changing the password signs everyone out, including this session.
        const session = await core.sessions.create(user.id);
        setSessionCookie(
          cookies,
          session.token,
          session.expiresAt,
          url.protocol === "https:",
        );
      }
      return { passwordSetFor: user.email };
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
  },

  remove: async ({ request, locals }) => {
    const id = userId(await request.formData());
    if (id === locals.user?.id) {
      return fail(400, { message: "You cannot delete your own account." });
    }
    try {
      await getCore().users.remove(id);
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
    return { removed: true };
  },
};

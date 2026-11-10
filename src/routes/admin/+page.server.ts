import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { m } from "#paraglide/messages.js";
import { getCore } from "#lib/server/index.ts";
import { setSessionCookie } from "#lib/server/auth.ts";
import { encodeInvite } from "#lib/invite.ts";
import {
  ConflictError,
  HouseholdInput,
  HouseholdPatch,
  NotFoundError,
  UserInput,
} from "#lib/server/core/index.ts";
import type { Actions, PageServerLoad } from "./$types";

// Only instance administrators get here: the request hook turns everyone
// else away from /admin, loads and actions alike.

export const load: PageServerLoad = async ({ locals }) => {
  const core = getCore();
  const [households, users] = await Promise.all([
    core.households.list(),
    core.users.list(),
  ]);
  return {
    households,
    users,
    currentUserId: locals.user?.id,
    /** Preselected when inviting: the household the admin is working in. */
    activeHouseholdId: locals.household?.id ?? null,
  };
};

const Id = z.coerce.number().int().positive();

const message = (e: unknown) => {
  if (e instanceof NotFoundError || e instanceof ConflictError) {
    return e.message;
  }
  throw e;
};

export const actions: Actions = {
  createHousehold: async ({ request }) => {
    const name = String((await request.formData()).get("name") ?? "");
    const parsed = HouseholdInput.safeParse({ name });
    if (!parsed.success) {
      return fail(400, {
        action: "createHousehold",
        message: parsed.error.issues[0]?.message,
      });
    }
    await getCore().households.create(parsed.data);
    return { action: "createHousehold", saved: true };
  },

  /** Name, icon and colour from the edit dialog. */
  updateHousehold: async ({ request }) => {
    const form = await request.formData();
    const id = Id.safeParse(form.get("householdId"));
    const parsed = HouseholdPatch.safeParse({
      name: form.get("name") ?? "",
      icon: String(form.get("icon") ?? "") || undefined,
      color: String(form.get("color") ?? "") || undefined,
    });
    if (!id.success || !parsed.success) {
      return fail(400, {
        action: "updateHousehold",
        householdId: id.success ? id.data : null,
        message:
          parsed.error?.issues[0]?.message ?? m.admin_unknown_household(),
      });
    }
    try {
      await getCore().households.update(id.data, parsed.data);
    } catch (e) {
      return fail(400, {
        action: "updateHousehold",
        householdId: id.data,
        message: message(e),
      });
    }
    return { action: "updateHousehold", householdId: id.data, saved: true };
  },

  addMember: async ({ request }) => {
    const form = await request.formData();
    const householdId = Id.safeParse(form.get("householdId"));
    const userId = Id.safeParse(form.get("userId"));
    if (!householdId.success || !userId.success) {
      return fail(400, {
        action: "addMember",
        householdId: householdId.success ? householdId.data : null,
        message: m.admin_choose_user_to_add(),
      });
    }
    try {
      await getCore().households.addMember(householdId.data, userId.data);
    } catch (e) {
      return fail(400, {
        action: "addMember",
        householdId: householdId.data,
        message: message(e),
      });
    }
    return { action: "addMember", householdId: householdId.data, saved: true };
  },

  removeMember: async ({ request }) => {
    const form = await request.formData();
    const householdId = Id.safeParse(form.get("householdId"));
    const userId = Id.safeParse(form.get("userId"));
    if (!householdId.success || !userId.success) {
      return fail(400, {
        action: "removeMember",
        message: m.admin_unknown_member(),
      });
    }
    await getCore().households.removeMember(householdId.data, userId.data);
    return {
      action: "removeMember",
      householdId: householdId.data,
      saved: true,
    };
  },

  /**
   * Creates the account with a random password and returns the invite link
   * token. The invitee joins the chosen household (none: assigned later).
   */
  invite: async ({ request }) => {
    const form = await request.formData();
    const parsed = UserInput.shape.email.safeParse(
      String(form.get("email") ?? ""),
    );
    if (!parsed.success) {
      return fail(400, { message: m.users_invite_invalid_email() });
    }
    const chosen = String(form.get("householdId") ?? "");
    const householdId = chosen === "" ? null : Id.safeParse(chosen);
    if (householdId && !householdId.success) {
      return fail(400, { message: m.admin_invite_choose_household() });
    }
    const core = getCore();
    try {
      // Fail before creating anything when the household is unknown.
      if (householdId) await core.households.get(householdId.data);
      const { user, password } = await core.users.invite(parsed.data);
      if (householdId) {
        await core.households.addMember(householdId.data, user.id);
      }
      return {
        invite: {
          email: user.email,
          token: encodeInvite({ email: user.email, password }),
        },
      };
    } catch (e) {
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
  },

  /** Replaces the password with a fresh random one and returns a new link. */
  reinvite: async ({ request, locals }) => {
    const id = Number((await request.formData()).get("id"));
    if (id === locals.user?.id) {
      return fail(400, { message: m.users_reinvite_self() });
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
    const id = Number(form.get("id"));
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

  /** Deletes the account everywhere (use removeMember to leave one household). */
  remove: async ({ request, locals }) => {
    const id = Number((await request.formData()).get("id"));
    if (id === locals.user?.id) {
      return fail(400, { message: m.users_delete_self() });
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

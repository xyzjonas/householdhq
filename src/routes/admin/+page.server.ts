import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { getCore } from "#lib/server/index.ts";
import {
  ConflictError,
  HouseholdInput,
  NotFoundError,
  UserInput,
} from "#lib/server/core/index.ts";
import type { Actions, PageServerLoad } from "./$types";

// Only instance administrators get here: the request hook turns everyone
// else away from /admin, loads and actions alike.

export const load: PageServerLoad = async () => {
  const core = getCore();
  const [households, users] = await Promise.all([
    core.households.list(),
    core.users.list(),
  ]);
  return { households, users };
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

  renameHousehold: async ({ request }) => {
    const form = await request.formData();
    const id = Id.safeParse(form.get("householdId"));
    const parsed = HouseholdInput.safeParse({ name: form.get("name") ?? "" });
    if (!id.success || !parsed.success) {
      return fail(400, {
        action: "renameHousehold",
        householdId: id.success ? id.data : null,
        message: parsed.error?.issues[0]?.message ?? "Unknown household",
      });
    }
    try {
      await getCore().households.rename(id.data, parsed.data);
    } catch (e) {
      return fail(400, {
        action: "renameHousehold",
        householdId: id.data,
        message: message(e),
      });
    }
    return { action: "renameHousehold", householdId: id.data, saved: true };
  },

  addMember: async ({ request }) => {
    const form = await request.formData();
    const householdId = Id.safeParse(form.get("householdId"));
    const userId = Id.safeParse(form.get("userId"));
    if (!householdId.success || !userId.success) {
      return fail(400, {
        action: "addMember",
        householdId: householdId.success ? householdId.data : null,
        message: "Choose a user to add.",
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
      return fail(400, { action: "removeMember", message: "Unknown member." });
    }
    await getCore().households.removeMember(householdId.data, userId.data);
    return {
      action: "removeMember",
      householdId: householdId.data,
      saved: true,
    };
  },

  createUser: async ({ request }) => {
    const form = await request.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const parsed = UserInput.safeParse({ email, password });
    if (!parsed.success) {
      return fail(400, {
        action: "createUser",
        email,
        errors: z.flattenError(parsed.error).fieldErrors,
      });
    }
    const core = getCore();
    const householdId = Id.safeParse(form.get("householdId"));
    try {
      // Fail before creating anything when the household is unknown.
      if (householdId.success) await core.households.get(householdId.data);
      const user = await core.users.create(parsed.data);
      if (householdId.success) {
        await core.households.addMember(householdId.data, user.id);
      }
    } catch (e) {
      return fail(400, {
        action: "createUser",
        email,
        errors: { email: [message(e)] },
      });
    }
    return { action: "createUser", saved: true };
  },
};

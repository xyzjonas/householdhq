import { m } from "#paraglide/messages.js";
import { fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { hq } from "#lib/server/index.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // "Out" accounts are external (expenses etc.); the view lists them in their
  // own section and keeps them out of the household totals.
  return { accounts: await hq(locals).accounts.listWithBalances() };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const name = String((await request.formData()).get("name") ?? "").trim();
    if (!name)
      return fail(400, { message: m.accounts_create_failed_no_name() });
    const account = await hq(locals).accounts.create({ name });
    redirect(303, resolve("/accounts/[id]", { id: String(account.id) }));
  },
};

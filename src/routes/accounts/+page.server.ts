import { fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { getCore } from "#lib/server/index.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // "Out" accounts are external (expenses etc.); the view lists them in their
  // own section and keeps them out of the household totals.
  return { accounts: await getCore().accounts.listWithBalances() };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const name = String((await request.formData()).get("name") ?? "").trim();
    if (!name) return fail(400, { message: "Please enter an account name." });
    const account = await getCore().accounts.create({ name });
    redirect(303, resolve("/accounts/[id]", { id: String(account.id) }));
  },
};

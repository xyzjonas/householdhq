import { fail } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
import { NotFoundError } from "#lib/server/core/index.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const core = getCore();
  const [accounts, balances, recent] = await Promise.all([
    core.accounts.listWithBalances(),
    core.accounts.balances(),
    core.transactions.list({ limit: 20 }),
  ]);
  return { accounts, balances, transactions: recent.items };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const id = Number((await request.formData()).get("id"));
    if (!Number.isInteger(id)) return fail(400, { message: "Invalid id" });
    try {
      await getCore().transactions.remove(id);
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
    return { deleted: id };
  },
};

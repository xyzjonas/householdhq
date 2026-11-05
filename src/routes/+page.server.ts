import { getCore } from "#lib/server/index.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const core = getCore();
  const [accounts, balances, recent] = await Promise.all([
    core.accounts.listWithBalances(),
    core.accounts.balances(),
    core.transactions.list({ limit: 20 }),
  ]);
  return { accounts, balances, transactions: recent.items };
};

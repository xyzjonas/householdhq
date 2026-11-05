import { getCore } from "#lib/server/index.ts";
import { parseView, toFilter } from "#lib/transactions-view.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const core = getCore();
  const view = parseView(url.searchParams);

  const [result, categories, accounts, tags] = await Promise.all([
    core.transactions.list(toFilter(view)),
    core.categories.list(),
    core.accounts.list(),
    core.transactions.tags(),
  ]);

  return {
    view,
    transactions: result.items,
    total: result.total,
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    accounts: accounts.map((a) => ({ id: a.id, name: a.name })),
    tags,
  };
};

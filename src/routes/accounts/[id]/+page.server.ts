import { error, fail } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
import { NotFoundError } from "#lib/server/core/index.ts";
import { PAGE_SIZE, monthRange } from "#lib/account-detail.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) error(404, "Account not found");
  const core = getCore();

  const account = await core.accounts
    .get(id)
    .catch((e: unknown) =>
      e instanceof NotFoundError ? error(404, e.message) : Promise.reject(e),
    );

  const month = monthRange(url.searchParams.get("month"));
  const categoryParam = Number(url.searchParams.get("category"));
  const categoryId =
    Number.isInteger(categoryParam) && categoryParam > 0
      ? categoryParam
      : undefined;
  const search = url.searchParams.get("q")?.trim() ?? "";
  const pageParam = Number(url.searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [balance, trajectory, categories, entries] = await Promise.all([
    core.accounts.balanceAt(id, new Date()),
    core.accounts.trajectory(id),
    core.categories.list(),
    core.transactions.list({
      accountId: id,
      from: month.from,
      to: month.to,
      categoryId,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const { points, projectedMonthEnd } = trajectory;
  const previous = points.length > 1 ? points[points.length - 2].balance : null;

  return {
    account,
    balance,
    /** Change versus the closing balance of the previous month. */
    delta: previous === null ? null : balance - previous,
    projectedMonthEnd,
    trajectory: points.map((p) => ({
      monthStart: p.monthStart.toISOString(),
      balance: p.balance,
    })),
    categories: categories.map(({ id, name }) => ({ id, name })),
    entries: entries.items,
    total: entries.total,
    filters: { month: month.key, categoryId, search, page },
  };
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

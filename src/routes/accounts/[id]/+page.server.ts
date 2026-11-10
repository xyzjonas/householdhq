import { m } from "#paraglide/messages.js";
import { error, fail } from "@sveltejs/kit";
import { hq } from "#lib/server/index.ts";
import { ConflictError, NotFoundError } from "#lib/server/core/index.ts";
import { PAGE_SIZE, monthRange } from "#lib/account-detail.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) error(404, m.accounts_api_not_found());
  const core = hq(locals);

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

  const hideUpcoming = url.searchParams.get("upcoming") === "hide";
  const checkpointsOnly = url.searchParams.get("states") === "only";
  const now = new Date();
  // `to` is exclusive: capping it at "now" drops everything scheduled later.
  const to = hideUpcoming && now < month.to ? now : month.to;

  const [balance, trajectory, categories, entries, suggestion] =
    await Promise.all([
      core.accounts.balanceAt(id, now),
      core.accounts.trajectory(id),
      core.categories.list(),
      core.ledger.forAccount(
        id,
        {
          from: month.from,
          to,
          categoryId,
          search: search || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        },
        { checkpointsOnly },
      ),
      core.checkpoints.suggest(id),
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
    /** The balance the transactions add up to: the checkpoint dialog's default. */
    suggestedCheckpoint: suggestion.balance,
    total: entries.total,
    filters: {
      month: month.key,
      categoryId,
      search,
      page,
      hideUpcoming,
      checkpointsOnly,
    },
  };
};

export const actions: Actions = {
  checkpoint: async ({ params, request, locals }) => {
    const id = Number(params.id);
    const raw = String((await request.formData()).get("amount") ?? "")
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");
    const amount = raw === "" ? NaN : Number(raw);
    if (!Number.isFinite(amount)) {
      return fail(400, {
        message: m.accounts_detail_checkpoint_amount_required(),
      });
    }
    try {
      const { adjustment } = await hq(locals).checkpoints.create(id, {
        amount,
      });
      return { checkpointed: true, adjustment: adjustment?.amount ?? 0 };
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
  },

  deleteCheckpoint: async ({ params, request, locals }) => {
    const accountId = Number(params.id);
    const id = Number((await request.formData()).get("id"));
    if (!Number.isInteger(id))
      return fail(400, { message: m.accounts_detail_invalid_id() });
    try {
      await hq(locals).checkpoints.remove(accountId, id);
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
    return { deletedCheckpoint: id };
  },

  delete: async ({ request, locals }) => {
    const id = Number((await request.formData()).get("id"));
    if (!Number.isInteger(id))
      return fail(400, { message: m.accounts_detail_invalid_id() });
    try {
      await hq(locals).transactions.remove(id);
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
    return { deleted: id };
  },
};

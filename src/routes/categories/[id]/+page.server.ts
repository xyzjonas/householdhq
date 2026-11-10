import { error, fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { hq } from "#lib/server/index.ts";
import { ConflictError, NotFoundError } from "#lib/server/core/index.ts";
import {
  monthKey,
  monthRange,
  parseMonth,
  shiftMonth,
} from "#lib/categories-view.ts";
import {
  PAGE_SIZE,
  averageSpend,
  parseChartRange,
  spendDelta,
} from "#lib/category-detail.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) error(404, "Category not found");
  const core = hq(locals);

  const category = await core.categories
    .get(id)
    .catch((e: unknown) =>
      e instanceof NotFoundError ? error(404, e.message) : Promise.reject(e),
    );

  const month = parseMonth(url.searchParams.get("month"));
  const { from, to } = monthRange(month);
  const range = parseChartRange(url.searchParams.get("range"));
  const all = url.searchParams.get("all") === "1";
  const search = url.searchParams.get("q")?.trim() ?? "";
  const pageParam = Number(url.searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  // The chart ends with the selected month and reaches back from there.
  const chartFrom =
    range === "all"
      ? undefined
      : monthRange(shiftMonth(month, 1 - Number(range))).from;

  const [
    series,
    incomeSeries,
    transferSeries,
    entries,
    allCategories,
    allTags,
    lifetime,
  ] = await Promise.all([
    core.categories.spendingByMonth(id, { from: chartFrom, to }),
    core.categories.spendingByMonth(id, { from: chartFrom, to }, "received"),
    core.categories.spendingByMonth(id, { from: chartFrom, to }, "transferred"),
    core.transactions.list({
      categoryId: id,
      ...(all ? {} : { from, to }),
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    core.categories.list(),
    core.tags.list(),
    core.transactions.list({ categoryId: id, limit: 1 }),
  ]);

  // Spending of the month in view (zero when the series starts later).
  const spent = series[series.length - 1]?.spent ?? 0;
  const monthEntries = all
    ? await core.transactions.list({ categoryId: id, from, to, limit: 1 })
    : entries;

  return {
    category,
    month,
    previousMonth: shiftMonth(month, -1),
    nextMonth: shiftMonth(month, 1),
    currentMonth: monthKey(new Date()),
    spent,
    delta: spendDelta(series),
    average: averageSpend(series),
    monthEntryCount: monthEntries.total,
    series: series.map((s) => ({
      monthStart: s.monthStart.toISOString(),
      spent: s.spent,
    })),
    incomeSeries: incomeSeries.map((s) => ({
      monthStart: s.monthStart.toISOString(),
      spent: s.spent,
    })),
    transferSeries: transferSeries.map((s) => ({
      monthStart: s.monthStart.toISOString(),
      spent: s.spent,
    })),
    entries: entries.items,
    total: entries.total,
    /** Every transaction ever booked here, regardless of the view filters. */
    lifetimeCount: lifetime.total,
    tags: allTags.map((t) => ({ name: t.name, color: t.color })),
    otherCategories: allCategories
      .filter((c) => c.id !== id)
      .map((c) => ({ id: c.id, name: c.name })),
    view: { month, range, all, search, page },
  };
};

export const actions: Actions = {
  /** Delete this category, moving its transactions to the chosen one. */
  removeCategory: async ({ params, request, locals }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return fail(404, { message: "Not found" });
    const formData = await request.formData();
    const raw = formData.get("reassignTo");
    const reassignTo = raw === null || raw === "" ? NaN : Number(raw);
    const tags = formData
      .getAll("tags")
      .map((t) => String(t).trim())
      .filter(Boolean);
    const core = hq(locals);
    try {
      if (Number.isInteger(reassignTo)) {
        await core.categories.remove(id, {
          reassignTo,
          tags,
        });
      } else {
        // Nothing to migrate: only then may it go without a replacement.
        const { total } = await core.transactions.list({
          categoryId: id,
          limit: 1,
        });
        if (total > 0) {
          return fail(400, { message: "Choose a category to move them to." });
        }
        await core.categories.remove(id);
      }
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
    redirect(303, resolve("/categories"));
  },

  delete: async ({ request, locals }) => {
    const id = Number((await request.formData()).get("id"));
    if (!Number.isInteger(id)) return fail(400, { message: "Invalid id" });
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

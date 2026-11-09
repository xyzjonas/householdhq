import { error, fail } from "@sveltejs/kit";
import { getCore } from "#lib/server/index.ts";
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

export const load: PageServerLoad = async ({ params, url }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) error(404, "Category not found");
  const core = getCore();

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

  const [series, incomeSeries, transferSeries, entries] = await Promise.all([
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
    view: { month, range, all, search, page },
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
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
    return { deleted: id };
  },
};

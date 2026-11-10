import { error, fail, redirect } from "@sveltejs/kit";
import { m } from "#paraglide/messages.js";
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

const parseId = (raw: string) => {
  const id = Number(raw);
  if (!Number.isInteger(id)) error(404, m.tags_not_found());
  return id;
};

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const id = parseId(params.id);
  const core = hq(locals);

  const tag = await core.tags
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
    core.tags.spendingByMonth(id, { from: chartFrom, to }),
    core.tags.spendingByMonth(id, { from: chartFrom, to }, "received"),
    core.tags.spendingByMonth(id, { from: chartFrom, to }, "transferred"),
    core.transactions.list({
      tag: tag.name,
      ...(all ? {} : { from, to }),
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  ]);

  // Spending of the month in view (zero when the series starts later).
  const spent = series[series.length - 1]?.spent ?? 0;
  const monthEntries = all
    ? await core.transactions.list({ tag: tag.name, from, to, limit: 1 })
    : entries;

  const serialize = (s: typeof series) =>
    s.map((point) => ({
      monthStart: point.monthStart.toISOString(),
      spent: point.spent,
    }));

  return {
    tag,
    month,
    previousMonth: shiftMonth(month, -1),
    nextMonth: shiftMonth(month, 1),
    currentMonth: monthKey(new Date()),
    spent,
    delta: spendDelta(series),
    average: averageSpend(series),
    monthEntryCount: monthEntries.total,
    series: serialize(series),
    incomeSeries: serialize(incomeSeries),
    transferSeries: serialize(transferSeries),
    entries: entries.items,
    total: entries.total,
    view: { month, range, all, search, page },
  };
};

export const actions: Actions = {
  /** Deletes one of the tag's transactions. */
  delete: async ({ request, locals }) => {
    const id = Number((await request.formData()).get("id"));
    if (!Number.isInteger(id))
      return fail(400, { message: m.tags_invalid_id() });
    try {
      await hq(locals).transactions.remove(id);
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
    return { deleted: id };
  },

  /** Deletes the tag itself; its transactions stay. */
  deleteTag: async ({ params, locals }) => {
    try {
      await hq(locals).tags.remove(parseId(params.id));
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
    redirect(303, resolve("/tags"));
  },
};

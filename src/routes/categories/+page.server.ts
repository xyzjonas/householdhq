import { getCore } from "#lib/server/index.ts";
import {
  monthKey,
  monthRange,
  parseMonth,
  shiftMonth,
} from "#lib/categories-view.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const month = parseMonth(url.searchParams.get("month"));
  const categories = await getCore().categories.listWithActivity(
    monthRange(month),
  );
  return {
    month,
    previousMonth: shiftMonth(month, -1),
    nextMonth: shiftMonth(month, 1),
    isCurrentMonth: month === monthKey(new Date()),
    categories,
  };
};

import { fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { hq } from "#lib/server/index.ts";
import {
  monthKey,
  monthRange,
  parseMonth,
  shiftMonth,
} from "#lib/categories-view.ts";
import { ConflictError } from "#lib/server/core/index.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const month = parseMonth(url.searchParams.get("month"));
  const categories = await hq(locals).categories.listWithActivity(
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

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const name = String((await request.formData()).get("name") ?? "").trim();
    if (!name) return fail(400, { message: "Please enter a category name." });
    try {
      await hq(locals).categories.create({ name });
    } catch (e) {
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
    redirect(303, resolve("/categories"));
  },
};

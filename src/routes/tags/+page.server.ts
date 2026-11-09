import { fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { getCore } from "#lib/server/index.ts";
import {
  monthKey,
  monthRange,
  parseMonth,
  shiftMonth,
} from "#lib/categories-view.ts";
import { ConflictError } from "#lib/server/core/index.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const month = parseMonth(url.searchParams.get("month"));
  const tags = await getCore().tags.listWithActivity(monthRange(month));
  return {
    month,
    previousMonth: shiftMonth(month, -1),
    nextMonth: shiftMonth(month, 1),
    isCurrentMonth: month === monthKey(new Date()),
    tags,
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const name = String((await request.formData()).get("name") ?? "").trim();
    if (!name) return fail(400, { message: "Please enter a tag name." });
    try {
      await getCore().tags.create({ name });
    } catch (e) {
      if (e instanceof ConflictError) return fail(409, { message: e.message });
      throw e;
    }
    redirect(303, resolve("/tags"));
  },
};

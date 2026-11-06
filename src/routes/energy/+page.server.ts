import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import { resolve } from "$app/paths";
import { getCore } from "#lib/server/index.ts";
import { MeterInput } from "#lib/server/core/index.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return { meters: await getCore().meters.list() };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const form = await request.formData();
    const parsed = MeterInput.safeParse({
      name: form.get("name") ?? "",
      unit: form.get("unit") ?? "",
      meterNumber: form.get("meterNumber"),
      icon: form.get("icon"),
      color: form.get("color"),
    });
    if (!parsed.success) {
      return fail(400, { message: z.prettifyError(parsed.error) });
    }
    const meter = await getCore().meters.create(parsed.data);
    redirect(303, resolve("/energy/[id]", { id: String(meter.id) }));
  },
};

import { error, fail } from "@sveltejs/kit";
import { z } from "zod";
import { m } from "#paraglide/messages.js";
import { hq } from "#lib/server/index.ts";
import {
  MeterPatch,
  MeterReadingInput,
  NotFoundError,
} from "#lib/server/core/index.ts";
import { meterStats, monthlyConsumption, parseChartMode } from "#lib/energy.ts";
import type { Actions, PageServerLoad } from "./$types";

function meterId(params: { id: string }): number {
  const id = Number(params.id);
  if (!Number.isInteger(id)) error(404, m.energy_error_not_found());
  return id;
}

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const meter = await hq(locals)
    .meters.get(meterId(params))
    .catch((e: unknown) =>
      e instanceof NotFoundError ? error(404, e.message) : Promise.reject(e),
    );
  const now = new Date();
  return {
    meter,
    mode: parseChartMode(url.searchParams.get("view")),
    months: monthlyConsumption(meter.readings, now),
    stats: meterStats(meter.readings, now),
  };
};

export const actions: Actions = {
  edit: async ({ params, request, locals }) => {
    const form = await request.formData();
    const parsed = MeterPatch.safeParse({
      name: form.get("name") ?? "",
      unit: form.get("unit") ?? "",
      meterNumber: form.get("meterNumber"),
      icon: form.get("icon"),
      color: form.get("color"),
    });
    if (!parsed.success) {
      return fail(400, { message: z.prettifyError(parsed.error) });
    }
    try {
      await hq(locals).meters.update(meterId(params), parsed.data);
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
    return { saved: true };
  },

  addReading: async ({ params, request, locals }) => {
    const form = await request.formData();
    const parsed = MeterReadingInput.safeParse({
      value: Number(
        String(form.get("value") ?? "")
          .replace(/\s/g, "")
          .replace(",", "."),
      ),
      meteredAt: form.get("meteredAt") || undefined,
    });
    if (!parsed.success) {
      return fail(400, { message: m.energy_error_invalid_reading() });
    }
    try {
      await hq(locals).meters.addReading(meterId(params), parsed.data);
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
    return { added: true };
  },

  deleteReading: async ({ request, locals }) => {
    const id = Number((await request.formData()).get("id"));
    if (!Number.isInteger(id))
      return fail(400, { message: m.energy_error_invalid_id() });
    try {
      await hq(locals).meters.removeReading(id);
    } catch (e) {
      if (e instanceof NotFoundError) return fail(404, { message: e.message });
      throw e;
    }
    return { deleted: id };
  },
};

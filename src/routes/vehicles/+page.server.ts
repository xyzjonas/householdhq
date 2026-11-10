import { redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { hq } from "#lib/server/index.ts";
import { failureFor, parseVehicleForm } from "#lib/server/vehicle-form.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const core = hq(locals);
  const [vehicles, categories, settings] = await Promise.all([
    core.vehicles.list(),
    core.categories.list(),
    core.settings.get(),
  ]);
  return {
    vehicles,
    categories: categories.map(({ id, name }) => ({ id, name })),
    currency: settings.currency,
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const parsed = parseVehicleForm(await request.formData());
    if ("failure" in parsed) return parsed.failure;
    let id: number;
    try {
      ({ id } = await hq(locals).vehicles.create(parsed.data));
    } catch (e) {
      return failureFor(e);
    }
    redirect(303, resolve("/vehicles/[id]", { id: String(id) }));
  },
};

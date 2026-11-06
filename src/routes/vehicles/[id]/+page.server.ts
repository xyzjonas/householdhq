import { error, fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { getCore } from "#lib/server/index.ts";
import { NotFoundError } from "#lib/server/core/index.ts";
import {
  failureFor,
  idField,
  parseFuelForm,
  parseServiceForm,
  parseVehicleForm,
} from "#lib/server/vehicle-form.ts";
import type { Actions, PageServerLoad } from "./$types";

/** Transactions listed on the vehicle's transactions tab. */
const TRANSACTION_LIMIT = 100;

const parseId = (raw: string) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) error(404, "Vehicle not found");
  return id;
};

export const load: PageServerLoad = async ({ params }) => {
  const id = parseId(params.id);
  const core = getCore();

  const vehicle = await core.vehicles
    .get(id)
    .catch((e: unknown) =>
      e instanceof NotFoundError ? error(404, e.message) : Promise.reject(e),
    );

  const [categories, components, transactions, settings] = await Promise.all([
    core.categories.list(),
    core.vehicles.components.list(),
    vehicle.categoryId
      ? core.transactions.list({
          categoryId: vehicle.categoryId,
          limit: TRANSACTION_LIMIT,
        })
      : { items: [], total: 0 },
    core.settings.get(),
  ]);

  return {
    vehicle,
    categories: categories.map(({ id, name }) => ({ id, name })),
    components,
    transactions: transactions.items,
    transactionTotal: transactions.total,
    currency: settings.currency,
  };
};

export const actions: Actions = {
  vehicle: async ({ params, request }) => {
    const parsed = parseVehicleForm(await request.formData());
    if ("failure" in parsed) return parsed.failure;
    try {
      await getCore().vehicles.update(parseId(params.id), parsed.data);
    } catch (e) {
      return failureFor(e);
    }
    return { saved: true };
  },

  deleteVehicle: async ({ params }) => {
    try {
      await getCore().vehicles.remove(parseId(params.id));
    } catch (e) {
      return failureFor(e);
    }
    redirect(303, resolve("/vehicles"));
  },

  /** Records a fill-up, or edits it when an `id` is posted. */
  fuel: async ({ params, request }) => {
    const form = await request.formData();
    const parsed = parseFuelForm(form);
    if ("failure" in parsed) return parsed.failure;
    const vehicleId = parseId(params.id);
    const entryId = idField(form, "id");
    try {
      if (entryId) {
        await getCore().vehicles.fuel.update(vehicleId, entryId, parsed.data);
      } else {
        await getCore().vehicles.fuel.create(vehicleId, parsed.data);
      }
    } catch (e) {
      return failureFor(e);
    }
    return { saved: true };
  },

  deleteFuel: async ({ params, request }) => {
    const entryId = idField(await request.formData(), "id");
    if (!entryId) return fail(400, { message: "Invalid id" });
    try {
      await getCore().vehicles.fuel.remove(parseId(params.id), entryId);
    } catch (e) {
      return failureFor(e);
    }
    return { deleted: entryId };
  },

  /** Records a service, or edits it when an `id` is posted. */
  service: async ({ params, request }) => {
    const form = await request.formData();
    const parsed = parseServiceForm(form);
    if ("failure" in parsed) return parsed.failure;
    const vehicleId = parseId(params.id);
    const entryId = idField(form, "id");
    try {
      if (entryId) {
        await getCore().vehicles.service.update(
          vehicleId,
          entryId,
          parsed.data,
        );
      } else {
        await getCore().vehicles.service.create(vehicleId, parsed.data);
      }
    } catch (e) {
      return failureFor(e);
    }
    return { saved: true };
  },

  deleteService: async ({ params, request }) => {
    const entryId = idField(await request.formData(), "id");
    if (!entryId) return fail(400, { message: "Invalid id" });
    try {
      await getCore().vehicles.service.remove(parseId(params.id), entryId);
    } catch (e) {
      return failureFor(e);
    }
    return { deleted: entryId };
  },
};

import { m } from "#paraglide/messages.js";
import { fail, type ActionFailure } from "@sveltejs/kit";
import type { ZodType, z } from "zod";
import {
  ConflictError,
  FuelEntryInput,
  NotFoundError,
  ServiceEntryInput,
  VehicleInput,
} from "#lib/server/core/index.ts";

/** What forms report when they are refused. */
export interface FormFailure {
  message: string;
}

type Parsed<T> = { data: T } | { failure: ActionFailure<FormFailure> };

/** The label of a form field, in the active language. */
function fieldLabel(key: string): string {
  switch (key) {
    case "name":
      return m.vehicles_field_name();
    case "brand":
      return m.vehicles_field_brand();
    case "model":
      return m.vehicles_field_model();
    case "vin":
      return m.vehicles_field_vin();
    case "registration":
      return m.vehicles_field_registration();
    case "purchasePrice":
      return m.vehicles_field_purchase_price();
    case "mass":
      return m.vehicles_field_mass();
    case "engineSize":
      return m.vehicles_field_engine_size();
    case "maxPower":
      return m.vehicles_field_max_power();
    case "defaultFuelTransactionTitle":
      return m.vehicles_field_fuel_transaction_title();
    case "purchasedAt":
      return m.vehicles_field_purchase_date();
    case "dateOfFabrication":
      return m.vehicles_field_date_of_fabrication();
    case "dateFirstRegistered":
      return m.vehicles_field_first_registration();
    case "fueledAt":
      return m.vehicles_field_date_and_time();
    case "odometer":
      return m.vehicles_field_odometer();
    case "fuelAmount":
      return m.vehicles_field_fuel_amount();
    case "unitPrice":
      return m.vehicles_field_unit_price();
    case "servicedAt":
      return m.vehicles_field_date_and_time();
    case "title":
      return m.vehicles_field_title();
    case "price":
      return m.vehicles_field_price();
    case "type":
      return m.vehicles_field_service_type();
    default:
      return key;
  }
}

/** "Check these fields: Name, VIN" instead of zod's technical messages. */
function parse<S extends ZodType>(
  schema: S,
  raw: unknown,
): Parsed<z.output<S>> {
  const result = schema.safeParse(raw);
  if (result.success) return { data: result.data };
  const fields = [
    ...new Set(
      result.error.issues.map((i) => {
        const key = String(i.path[0] ?? "");
        return fieldLabel(key);
      }),
    ),
  ];
  return {
    failure: fail(400, {
      message: m.vehicles_form_check_fields({ fields: fields.join(", ") }),
    }),
  };
}

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

/** Empty means "not set". */
const optional = (form: FormData, name: string) => text(form, name) || null;

/** Accepts a decimal comma; garbage becomes NaN and is rejected by the schema. */
const optionalNumber = (form: FormData, name: string) => {
  const value = optional(form, name);
  return value === null
    ? null
    : Number(value.replace(/\s/g, "").replace(",", "."));
};

const flag = (form: FormData, name: string) => form.get(name) === "on";

export function parseVehicleForm(
  form: FormData,
): Parsed<z.output<typeof VehicleInput>> {
  return parse(VehicleInput, {
    name: text(form, "name"),
    brand: text(form, "brand"),
    model: text(form, "model"),
    vin: text(form, "vin"),
    registration: text(form, "registration"),
    color: optional(form, "color"),
    icon: optional(form, "icon"),
    fuelType: optional(form, "fuelType"),
    purchasePrice: optionalNumber(form, "purchasePrice"),
    purchasedAt: optional(form, "purchasedAt"),
    mass: optionalNumber(form, "mass"),
    engineSize: optionalNumber(form, "engineSize"),
    maxPower: optionalNumber(form, "maxPower"),
    dateOfFabrication: optional(form, "dateOfFabrication"),
    dateFirstRegistered: optional(form, "dateFirstRegistered"),
    defaultFuelTransactionTitle:
      text(form, "defaultFuelTransactionTitle") || undefined,
    categoryId: optionalNumber(form, "categoryId"),
    fuelCategoryId: optionalNumber(form, "fuelCategoryId"),
  });
}

/**
 * `previous` is "auto" (let the core choose, or keep it on edits), "none" or
 * the id of a full tank.
 */
export function parseFuelForm(
  form: FormData,
): Parsed<z.output<typeof FuelEntryInput>> {
  const previous = text(form, "previousFullTank");
  return parse(FuelEntryInput, {
    fueledAt: text(form, "fueledAt"),
    odometer: optionalNumber(form, "odometer") ?? NaN,
    fuelAmount: optionalNumber(form, "fuelAmount") ?? NaN,
    unitPrice: optionalNumber(form, "unitPrice") ?? NaN,
    isFullTank: flag(form, "isFullTank"),
    previousFullTankFuelEntryId:
      previous === "" || previous === "auto"
        ? undefined
        : previous === "none"
          ? null
          : Number(previous),
  });
}

export function parseServiceForm(
  form: FormData,
): Parsed<z.output<typeof ServiceEntryInput>> {
  return parse(ServiceEntryInput, {
    type: text(form, "type"),
    title: text(form, "title"),
    servicedAt: text(form, "servicedAt"),
    odometer: optionalNumber(form, "odometer"),
    price: optionalNumber(form, "price"),
    description: optional(form, "description"),
    componentIds: form.getAll("componentIds").map(Number),
  });
}

/** The id posted as `name`, or a ready-made failure. */
export function idField(form: FormData, name: string): number | null {
  const id = Number(form.get(name));
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Turns the core's domain errors into form failures; rethrows the rest. */
export function failureFor(e: unknown): ActionFailure<FormFailure> {
  if (e instanceof NotFoundError) return fail(404, { message: e.message });
  if (e instanceof ConflictError) return fail(409, { message: e.message });
  throw e;
}

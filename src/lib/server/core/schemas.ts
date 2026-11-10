import { z } from "zod";
import { serializeEnabledModules } from "../../modules";
import { m } from "#paraglide/messages.js";

// Localizes zod's built-in messages. The handler runs per issue, at parse
// time, so the message follows the locale of the request being served.
z.config({
  customError: (iss) => {
    switch (iss.code) {
      case "invalid_type":
        return iss.input === undefined
          ? m.core_validation_required()
          : m.core_validation_invalid_type();
      case "too_small": {
        const min = Number(iss.minimum);
        if (iss.origin === "string" && min === 1) {
          return m.core_validation_required();
        }
        if (iss.origin === "string")
          return m.core_validation_string_min({ min });
        if (iss.origin === "array") return m.core_validation_array_min({ min });
        return iss.inclusive
          ? m.core_validation_number_min({ min })
          : m.core_validation_number_above({ min });
      }
      case "too_big": {
        const max = Number(iss.maximum);
        if (iss.origin === "string")
          return m.core_validation_string_max({ max });
        if (iss.origin === "array") return m.core_validation_array_max({ max });
        return iss.inclusive
          ? m.core_validation_number_max({ max })
          : m.core_validation_number_below({ max });
      }
      case "invalid_format":
        return iss.format === "email"
          ? m.core_validation_email()
          : m.core_validation_invalid_format();
      case "invalid_value":
        return m.core_validation_invalid_value();
      default:
        return m.core_validation_invalid();
    }
  },
});

const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullish();

export const sourceTypes = [
  "OUT",
  "ACCOUNT",
  "CASH",
  "SAVINGS",
  "INVESTMENT",
  "RETIREMENT",
  "DEBT",
] as const;

export const CategoryInput = z.object({
  name: z.string().trim().min(1),
  description: optionalText,
  icon: optionalText,
  color: optionalText,
});
export type CategoryInput = z.infer<typeof CategoryInput>;
export const CategoryPatch = CategoryInput.partial();
export type CategoryPatch = z.infer<typeof CategoryPatch>;

export const TagInput = z.object({
  name: z.string().trim().min(1),
  description: optionalText,
  icon: optionalText,
  color: optionalText,
});
export type TagInput = z.infer<typeof TagInput>;
export const TagPatch = TagInput.partial();
export type TagPatch = z.infer<typeof TagPatch>;

// Patch schemas are built from default-free shapes: zod's `.partial()` would
// keep `.default()` values and silently reset omitted fields on update.
const accountShape = {
  name: z.string().trim().min(1),
  type: z.enum(sourceTypes),
  color: optionalText,
  position: z.number().int(),
  isOut: z.boolean(),
  isDisponible: z.boolean(),
  isPortfolio: z.boolean(),
};
export const AccountInput = z.object({
  ...accountShape,
  type: accountShape.type.default("ACCOUNT"),
  position: accountShape.position.default(999),
  isOut: accountShape.isOut.default(false),
  isDisponible: accountShape.isDisponible.default(false),
  isPortfolio: accountShape.isPortfolio.default(false),
});
export type AccountInput = z.input<typeof AccountInput>;
export const AccountPatch = z.object(accountShape).partial();
export type AccountPatch = z.input<typeof AccountPatch>;

const transactionShape = {
  description: z.string().trim().min(1),
  amount: z.number(),
  currency: z.string().length(3),
  transactedAt: z.coerce.date(),
  sourceId: z.number().int(),
  targetId: z.number().int(),
  categoryId: z.number().int().nullable(),
  recurring: z.number().int().min(0),
  isImportant: z.boolean(),
  isHidden: z.boolean(),
  tags: z.array(z.string().trim().min(1)),
};
export const TransactionInput = z.object({
  ...transactionShape,
  description: transactionShape.description.default("N/A"),
  currency: transactionShape.currency.default("CZK"),
  transactedAt: transactionShape.transactedAt.optional(),
  categoryId: transactionShape.categoryId.nullish(),
  recurring: transactionShape.recurring.default(0),
  isImportant: transactionShape.isImportant.default(false),
  isHidden: transactionShape.isHidden.default(false),
  tags: transactionShape.tags.default([]),
});
export type TransactionInput = z.input<typeof TransactionInput>;
export const TransactionPatch = z.object(transactionShape).partial();
export type TransactionPatch = z.input<typeof TransactionPatch>;

export const TransactionFlow = z.enum(["spent", "received", "transfer"]);
export type TransactionFlow = z.infer<typeof TransactionFlow>;

export const TransactionStatus = z.enum(["completed", "pending", "cancelled"]);
export type TransactionStatus = z.infer<typeof TransactionStatus>;

export const TransactionSort = z.enum([
  "date-desc",
  "date-asc",
  "amount-desc",
  "amount-asc",
]);
export type TransactionSort = z.infer<typeof TransactionSort>;

export const TransactionFilter = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  categoryId: z.number().int().optional(),
  /** Only transactions without a category. */
  uncategorized: z.boolean().optional(),
  /** Either side of the transaction. */
  accountId: z.number().int().optional(),
  sourceId: z.number().int().optional(),
  targetId: z.number().int().optional(),
  flow: TransactionFlow.optional(),
  status: TransactionStatus.optional(),
  important: z.boolean().optional(),
  recurring: z.boolean().optional(),
  hidden: z.boolean().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  /** Tag name. */
  tag: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
  /** Defaults to newest first; a search without a sort ranks by relevance. */
  sort: TransactionSort.optional(),
  limit: z.number().int().min(1).max(500).default(50),
  offset: z.number().int().min(0).default(0),
});
export type TransactionFilter = z.input<typeof TransactionFilter>;

export const vehicleServiceTypes = [
  "REGULAR_MAINTENANCE",
  "DEFECT",
  "FEES",
  "UPGRADE",
] as const;
export const VehicleServiceType = z.enum(vehicleServiceTypes);
export type VehicleServiceType = z.infer<typeof VehicleServiceType>;

const optionalNumber = z.number().nonnegative().nullable();
const optionalDate = z.coerce.date().nullable();
const optionalId = z.number().int().positive().nullable();

const vehicleShape = {
  name: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  vin: z.string().trim().min(1),
  registration: z.string().trim().min(1),
  color: optionalText,
  icon: optionalText,
  fuelType: optionalText,
  purchasePrice: optionalNumber,
  purchasedAt: optionalDate,
  mass: optionalNumber,
  engineSize: optionalNumber,
  maxPower: optionalNumber,
  dateOfFabrication: optionalDate,
  dateFirstRegistered: optionalDate,
  defaultFuelTransactionTitle: z.string().trim().min(1),
  /** Category of service entries' transactions. */
  categoryId: optionalId,
  /** Category of fuel entries' transactions. */
  fuelCategoryId: optionalId,
};
export const VehicleInput = z.object({
  ...vehicleShape,
  purchasePrice: optionalNumber.optional(),
  purchasedAt: optionalDate.optional(),
  mass: optionalNumber.optional(),
  engineSize: optionalNumber.optional(),
  maxPower: optionalNumber.optional(),
  dateOfFabrication: optionalDate.optional(),
  dateFirstRegistered: optionalDate.optional(),
  defaultFuelTransactionTitle:
    vehicleShape.defaultFuelTransactionTitle.default("Fuel"),
  categoryId: optionalId.optional(),
  fuelCategoryId: optionalId.optional(),
});
export type VehicleInput = z.input<typeof VehicleInput>;
export const VehiclePatch = z.object(vehicleShape).partial();
export type VehiclePatch = z.input<typeof VehiclePatch>;

const fuelEntryShape = {
  fueledAt: z.coerce.date(),
  odometer: z.number().nonnegative(),
  fuelAmount: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  isFullTank: z.boolean(),
  /**
   * The full tank this one is measured against. Omitted: pick the latest
   * earlier full tank; `null`: there is none.
   */
  previousFullTankFuelEntryId: z.number().int().positive().nullable(),
};
export const FuelEntryInput = z.object({
  ...fuelEntryShape,
  isFullTank: fuelEntryShape.isFullTank.default(true),
  previousFullTankFuelEntryId:
    fuelEntryShape.previousFullTankFuelEntryId.optional(),
});
export type FuelEntryInput = z.input<typeof FuelEntryInput>;
export const FuelEntryPatch = z.object(fuelEntryShape).partial();
export type FuelEntryPatch = z.input<typeof FuelEntryPatch>;

const serviceEntryShape = {
  type: VehicleServiceType,
  title: z.string().trim().min(1),
  servicedAt: z.coerce.date(),
  odometer: optionalNumber,
  description: optionalText,
  /** What the service cost: the amount of its transaction. */
  price: optionalNumber,
  componentIds: z.array(z.number().int().positive()),
};
export const ServiceEntryInput = z.object({
  ...serviceEntryShape,
  odometer: optionalNumber.optional(),
  price: optionalNumber.optional(),
  componentIds: serviceEntryShape.componentIds.default([]),
});
export type ServiceEntryInput = z.input<typeof ServiceEntryInput>;
export const ServiceEntryPatch = z.object(serviceEntryShape).partial();
export type ServiceEntryPatch = z.input<typeof ServiceEntryPatch>;

export const VehicleComponentInput = z.object({
  name: z.string().trim().min(1),
  icon: optionalText,
  color: optionalText,
  description: optionalText,
});
export type VehicleComponentInput = z.input<typeof VehicleComponentInput>;
export const VehicleComponentPatch = VehicleComponentInput.partial();
export type VehicleComponentPatch = z.input<typeof VehicleComponentPatch>;

export const CheckpointInput = z.object({
  /** The balance the account really has. */
  amount: z.number().finite(),
  /** Defaults to now. */
  at: z.coerce.date().optional(),
});
export type CheckpointInput = z.input<typeof CheckpointInput>;

export const UserInput = z.object({
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: () => m.core_password_min() })
    .max(200, { error: () => m.core_password_max() }),
});
export type UserInput = z.input<typeof UserInput>;

/** Omitted icon and colour fall back to the household defaults. */
export const HouseholdInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: () => m.core_household_name_required() })
    .max(100),
  icon: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{1,50}$/, {
      error: () => m.core_household_icon_invalid(),
    })
    .optional(),
  color: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^#[0-9a-f]{6}$/, { error: () => m.core_household_color_invalid() })
    .optional(),
});
export type HouseholdInput = z.input<typeof HouseholdInput>;
export const HouseholdPatch = HouseholdInput.partial();
export type HouseholdPatch = z.input<typeof HouseholdPatch>;

export const SettingsInput = z.object({
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, { error: () => m.core_settings_currency_invalid() }),
  fiscalIntervalStartDay: z.coerce
    .number()
    .int({ error: () => m.core_settings_day_whole() })
    .min(1, { error: () => m.core_settings_day_range() })
    .max(31, { error: () => m.core_settings_day_range() }),
  mankoCategoryId: z.coerce
    .number()
    .int({ error: () => m.core_settings_choose_category() })
    .positive({ error: () => m.core_settings_choose_category() }),
  defaultOutAccountId: z.coerce
    .number()
    .int({ error: () => m.core_settings_choose_account() })
    .positive({ error: () => m.core_settings_choose_account() }),
  /** Module keys; stored as a normalised comma-separated list. */
  enabledModules: z.array(z.string()).transform(serializeEnabledModules),
});
export type SettingsInput = z.input<typeof SettingsInput>;
export const SettingsPatch = SettingsInput.partial();
export type SettingsPatch = z.input<typeof SettingsPatch>;

const meterShape = {
  name: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  meterNumber: optionalText,
  icon: optionalText,
  color: optionalText,
};
export const MeterInput = z.object(meterShape);
export type MeterInput = z.input<typeof MeterInput>;
export const MeterPatch = z.object(meterShape).partial();
export type MeterPatch = z.input<typeof MeterPatch>;

export const MeterReadingInput = z.object({
  value: z.number().finite(),
  /** Defaults to now. */
  meteredAt: z.coerce.date().optional(),
});
export type MeterReadingInput = z.input<typeof MeterReadingInput>;

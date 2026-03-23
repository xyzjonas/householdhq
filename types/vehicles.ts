import { z } from "zod";

const EmbeddedSourceSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  color: z.string().nullable(),
  type: z.string(),
  isOut: z.boolean(),
  isDisponible: z.boolean(),
  isPortfolio: z.boolean(),
  position: z.number(),
});

const EmbeddedCategorySchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    description: z.string().nullable(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
  })
  .nullable();

const EmbeddedProjectSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    color: z.string().nullable(),
    description: z.string().nullable(),
    isCompleted: z.boolean(),
  })
  .nullable();

const EmbeddedTagSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
});

const TransactionWithIncludesSchema = z.object({
  id: z.number().int(),
  created: z.coerce.date(),
  transactedAt: z.coerce.date().nullable(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  cancelled: z.boolean(),
  confirmed: z.boolean(),
  recurring: z.number(),
  isImportant: z.boolean(),
  isHidden: z.boolean(),
  categoryId: z.number().int().nullable(),
  category: EmbeddedCategorySchema,
  sourceId: z.number().int(),
  source: EmbeddedSourceSchema,
  projectId: z.number().int().nullable(),
  project: EmbeddedProjectSchema,
  targetId: z.number().int(),
  target: EmbeddedSourceSchema,
  vehicleId: z.number().int().nullable(),
  tags: z.array(EmbeddedTagSchema),
});

const EmbeddedTransactionSummarySchema = z.object({
  id: z.number().int(),
  transactedAt: z.coerce.date().nullable(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
});

const PreviousFullTankEntrySchema = z
  .object({
    id: z.number().int(),
    fueledAt: z.coerce.date(),
    odometer: z.number(),
    isFullTank: z.boolean(),
  })
  .nullable();

export const VehicleServiceTypeSchema = z.enum([
  "REGULAR_MAINTENANCE",
  "DEFECT",
]);

export const VehicleFuelEntrySchema = z.object({
  id: z.number().int(),
  fueledAt: z.coerce.date(),
  odometer: z.number(),
  fuelAmount: z.number(),
  unitPrice: z.number(),
  isFullTank: z.boolean(),
  vehicleId: z.number().int(),
  transactionId: z.number().int(),
  previousFullTankFuelEntryId: z.number().int().nullable(),
  previousFullTankFuelEntry: PreviousFullTankEntrySchema,
  transaction: EmbeddedTransactionSummarySchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const VehicleServiceEntrySchema = z.object({
  id: z.number().int(),
  type: VehicleServiceTypeSchema,
  odometer: z.number().nullable(),
  title: z.string(),
  servicedAt: z.coerce.date(),
  description: z.string().nullable(),
  vehicleId: z.number().int(),
  transactionId: z.number().int(),
  transaction: EmbeddedTransactionSummarySchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const VehicleSchema = z.object({
  id: z.number().int(),
  vin: z.string(),
  registration: z.string(),
  name: z.string(),
  brand: z.string(),
  model: z.string(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  purchasePrice: z.number().nullable().optional(),
  purchasedAt: z.date().nullable().optional(),
  mass: z.number().nullable().optional(),
  engineSize: z.number().nullable().optional(),
  fuelType: z.string().nullable().optional(),
  maxPower: z.number().nullable().optional(),
  dateOfFabrication: z.date().nullable().optional(),
  dateFirstRegistered: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  categoryId: z.number().int().nullable().optional(),
});

export const VehicleDetailSchema = VehicleSchema.extend({
  transactions: z.array(TransactionWithIncludesSchema),
  linkedCategory: EmbeddedCategorySchema,
  fuelEntries: z.array(VehicleFuelEntrySchema),
  serviceEntries: z.array(VehicleServiceEntrySchema),
});

export const VehicleCreateSchema = z.object({
  vin: z.string().min(1, "VIN is required"),
  registration: z.string().min(1, "Registration is required"),
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  purchasePrice: z.coerce.number().nullable().optional(),
  purchasedAt: z.coerce.date().nullable().optional(),
  mass: z.coerce.number().nullable().optional(),
  engineSize: z.coerce.number().nullable().optional(),
  fuelType: z.string().nullable().optional(),
  maxPower: z.coerce.number().nullable().optional(),
  dateOfFabrication: z.coerce.date().nullable().optional(),
  dateFirstRegistered: z.coerce.date().nullable().optional(),
  categoryId: z.coerce.number().int().nullable().optional(),
});

export const VehicleUpdateSchema = VehicleCreateSchema.partial();

export const VehicleFuelEntryCreateSchema = z.object({
  fueledAt: z.coerce.date(),
  odometer: z.coerce.number().nonnegative(),
  fuelAmount: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  isFullTank: z.boolean(),
  previousFullTankFuelEntryId: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
});

export const VehicleFuelEntryUpdateSchema =
  VehicleFuelEntryCreateSchema.partial();

export const VehicleServiceEntryCreateSchema = z.object({
  type: VehicleServiceTypeSchema,
  odometer: z.coerce.number().nonnegative().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  servicedAt: z.coerce.date(),
  description: z.string().nullable().optional(),
});

export const VehicleServiceEntryUpdateSchema =
  VehicleServiceEntryCreateSchema.partial();

export const VehicleScopedParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const VehicleEntryParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  entryId: z.coerce.number().int().positive(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleDetail = z.infer<typeof VehicleDetailSchema>;
export type VehicleCreate = z.infer<typeof VehicleCreateSchema>;
export type VehicleUpdate = z.infer<typeof VehicleUpdateSchema>;
export type VehicleServiceType = z.infer<typeof VehicleServiceTypeSchema>;
export type VehicleFuelEntry = z.infer<typeof VehicleFuelEntrySchema>;
export type VehicleServiceEntry = z.infer<typeof VehicleServiceEntrySchema>;
export type VehicleFuelEntryCreate = z.infer<
  typeof VehicleFuelEntryCreateSchema
>;
export type VehicleFuelEntryUpdate = z.infer<
  typeof VehicleFuelEntryUpdateSchema
>;
export type VehicleServiceEntryCreate = z.infer<
  typeof VehicleServiceEntryCreateSchema
>;
export type VehicleServiceEntryUpdate = z.infer<
  typeof VehicleServiceEntryUpdateSchema
>;
export type VehicleScopedParams = z.infer<typeof VehicleScopedParamsSchema>;
export type VehicleEntryParams = z.infer<typeof VehicleEntryParamsSchema>;

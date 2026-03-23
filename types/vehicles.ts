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

export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleDetail = z.infer<typeof VehicleDetailSchema>;
export type VehicleCreate = z.infer<typeof VehicleCreateSchema>;
export type VehicleUpdate = z.infer<typeof VehicleUpdateSchema>;

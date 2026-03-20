import { z } from "zod";

const TransactionMinimalSchema = z.object({
  id: z.number().int(),
  created: z.date(),
  transactedAt: z.date().nullable(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  cancelled: z.boolean(),
  confirmed: z.boolean(),
  recurring: z.number(),
  isImportant: z.boolean(),
  isHidden: z.boolean(),
  categoryId: z.number().int().nullable(),
  sourceId: z.number().int(),
  projectId: z.number().int().nullable(),
  targetId: z.number().int(),
  vehicleId: z.number().int().nullable(),
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
});

export const VehicleDetailSchema = VehicleSchema.extend({
  transactions: z.array(TransactionMinimalSchema),
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
});

export const VehicleUpdateSchema = VehicleCreateSchema.partial();

export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleDetail = z.infer<typeof VehicleDetailSchema>;
export type VehicleCreate = z.infer<typeof VehicleCreateSchema>;
export type VehicleUpdate = z.infer<typeof VehicleUpdateSchema>;

import { z } from "zod";

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
  createdAt: z.date(),
  updatedAt: z.date(),
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
});

export const VehicleUpdateSchema = VehicleCreateSchema.partial();

export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleCreate = z.infer<typeof VehicleCreateSchema>;
export type VehicleUpdate = z.infer<typeof VehicleUpdateSchema>;

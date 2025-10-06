import { z } from "zod";

export const MeterStateSchema = z.object({
  id: z.number().int(),
  value: z.number(),
  meteredAt: z.date(),
  meterId: z.number().int(),
  isComputed: z.boolean().optional(),
});

export const MeterSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  created: z.date(),
  unit: z.string(),
  icon: z.string().nullable().optional(),
  states: z.array(MeterStateSchema).optional(),
});

export const MeterStateCreateSchema = z.object({
  value: z.coerce.number(),
  meteredAt: z.coerce.date(),
  meterId: z.coerce.number().int(),
});

export const MeterCreateSchema = z.object({
  name: z.string(),
  unit: z.string(),
  icon: z.string().nullable().optional(),
  isComputed: z.boolean().optional(),
});

export const MeterStateUpdateSchema = MeterStateCreateSchema.partial();

export const MeterUpdateSchema = MeterCreateSchema.partial();

export type MeterState = z.infer<typeof MeterStateSchema>;
export type Meter = z.infer<typeof MeterSchema>;
export type MeterStateCreate = z.infer<typeof MeterStateCreateSchema>;
export type MeterCreate = z.infer<typeof MeterCreateSchema>;
export type MeterStateUpdate = z.infer<typeof MeterStateUpdateSchema>;
export type MeterUpdate = z.infer<typeof MeterUpdateSchema>;

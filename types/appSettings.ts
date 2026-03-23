import { z } from 'zod';

/**
 * App settings schema - singleton table with all settings as columns
 */
export const AppSettingSchema = z.object({
  id: z.number(),
  currency: z.string().default('USD'),
  defaultFuelTransactionTitle: z.string().default('Fuel'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AppSetting = z.infer<typeof AppSettingSchema>;

/**
 * Create/Update app settings schema - partial fields
 */
export const UpdateAppSettingSchema = z.object({
  currency: z.string().optional(),
  defaultFuelTransactionTitle: z.string().min(1).optional(),
}).strip().partial();

export type UpdateAppSetting = z.infer<typeof UpdateAppSettingSchema>;

/**
 * Known settings - typed access to available settings
 */
export const KnownSettingsSchema = z.object({
  currency: z.string().default('USD'),
  defaultFuelTransactionTitle: z.string().default('Fuel'),
});

export type KnownSettings = z.infer<typeof KnownSettingsSchema>;

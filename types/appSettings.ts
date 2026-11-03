import { z } from "zod";

/**
 * Calendar day (1-31) on which the monthly fiscal period ends.
 */
export const FiscalPeriodEndDaySchema = z.coerce.number().int().min(1).max(31);

/**
 * App settings schema - singleton table with all settings as columns
 */
export const AppSettingSchema = z.object({
  id: z.number(),
  currency: z.string().default("USD"),
  fiscalPeriodEndDay: FiscalPeriodEndDaySchema.default(31),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AppSetting = z.infer<typeof AppSettingSchema>;

/**
 * Create/Update app settings schema - partial fields
 */
export const UpdateAppSettingSchema = z
  .object({
    currency: z.string().optional(),
    fiscalPeriodEndDay: FiscalPeriodEndDaySchema.optional(),
  })
  .strip()
  .partial();

export type UpdateAppSetting = z.infer<typeof UpdateAppSettingSchema>;

/**
 * Known settings - typed access to available settings
 */
export const KnownSettingsSchema = z.object({
  currency: z.string().default("USD"),
  fiscalPeriodEndDay: FiscalPeriodEndDaySchema.default(31),
});

export type KnownSettings = z.infer<typeof KnownSettingsSchema>;

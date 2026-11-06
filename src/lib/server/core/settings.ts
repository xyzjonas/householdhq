import type { Db } from "./prisma";
import { SettingsPatch } from "./schemas";
import { NotFoundError, type AppSettings } from "./types";

/** `AppSettings` is a singleton row; it always lives under this id. */
const SETTINGS_ID = 1;

/** Category checkpoint adjustments land in until another one is chosen. */
export const FALLBACK_CATEGORY = "N/A";

export function settingsRepo(db: Db) {
  return {
    /**
     * The app settings, created with their defaults on first access. The
     * manko category always resolves: it falls back to the "N/A" category,
     * which is created when missing (or after its category was deleted).
     */
    async get(): Promise<AppSettings> {
      const settings = await db.appSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID },
        update: {},
      });
      if (settings.mankoCategoryId != null) return settings;
      const fallback = await db.category.upsert({
        where: { name: FALLBACK_CATEGORY },
        create: {
          name: FALLBACK_CATEGORY,
          description: "Uncategorised, e.g. balance checkpoint adjustments",
        },
        update: {},
      });
      return await db.appSettings.update({
        where: { id: SETTINGS_ID },
        data: { mankoCategoryId: fallback.id },
      });
    },

    /** Changes the given settings only; omitted ones keep their value. */
    async update(input: SettingsPatch): Promise<AppSettings> {
      const data = SettingsPatch.parse(input);
      if (data.mankoCategoryId !== undefined) {
        const category = await db.category.findUnique({
          where: { id: data.mankoCategoryId },
        });
        if (!category)
          throw new NotFoundError("Category", data.mankoCategoryId);
      }
      return await db.appSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID, ...data },
        update: data,
      });
    },
  };
}

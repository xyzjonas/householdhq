import type { Db } from "./prisma";
import { SettingsPatch } from "./schemas";
import type { AppSettings } from "./types";

/** `AppSettings` is a singleton row; it always lives under this id. */
const SETTINGS_ID = 1;

export function settingsRepo(db: Db) {
  return {
    /** The app settings, created with their defaults on first access. */
    async get(): Promise<AppSettings> {
      return await db.appSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID },
        update: {},
      });
    },

    /** Changes the given settings only; omitted ones keep their value. */
    async update(input: SettingsPatch): Promise<AppSettings> {
      const data = SettingsPatch.parse(input);
      return await db.appSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID, ...data },
        update: data,
      });
    },
  };
}

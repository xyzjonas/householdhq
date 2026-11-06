import type { Db } from "./prisma";
import { SettingsPatch } from "./schemas";
import { ConflictError, NotFoundError, type AppSettings } from "./types";

/** `AppSettings` is a singleton row; it always lives under this id. */
const SETTINGS_ID = 1;

/** Category checkpoint adjustments land in until another one is chosen. */
export const FALLBACK_CATEGORY = "N/A";

export function settingsRepo(db: Db) {
  return {
    /**
     * The app settings, created with their defaults on first access. Two
     * settings always resolve once set up:
     *  - the manko category falls back to "N/A", created when missing (or
     *    after its category was deleted);
     *  - the default out account falls back to the convention (the external
     *    account with id 2), then to the first external account. It stays
     *    null only while no external account exists.
     */
    async get(): Promise<AppSettings> {
      let settings = await db.appSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID },
        update: {},
      });
      const fill: { mankoCategoryId?: number; defaultOutAccountId?: number } =
        {};
      if (settings.mankoCategoryId == null) {
        const fallback = await db.category.upsert({
          where: { name: FALLBACK_CATEGORY },
          create: {
            name: FALLBACK_CATEGORY,
            description: "Uncategorised, e.g. balance checkpoint adjustments",
          },
          update: {},
        });
        fill.mankoCategoryId = fallback.id;
      }
      if (settings.defaultOutAccountId == null) {
        const out =
          (await db.source.findFirst({ where: { id: 2, isOut: true } })) ??
          (await db.source.findFirst({
            where: { isOut: true },
            orderBy: [{ position: "asc" }, { id: "asc" }],
          }));
        if (out) fill.defaultOutAccountId = out.id;
      }
      if (Object.keys(fill).length > 0) {
        settings = await db.appSettings.update({
          where: { id: SETTINGS_ID },
          data: fill,
        });
      }
      return settings;
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
      if (data.defaultOutAccountId !== undefined) {
        const account = await db.source.findUnique({
          where: { id: data.defaultOutAccountId },
        });
        if (!account) {
          throw new NotFoundError("Account", data.defaultOutAccountId);
        }
        if (!account.isOut) {
          throw new ConflictError(
            `'${account.name}' is not an external account`,
          );
        }
      }
      return await db.appSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID, ...data },
        update: data,
      });
    },
  };
}

import { buildItems, type CategoryItem } from "#lib/categories-view.ts";
import type { TagWithActivity } from "#lib/server/core/types.ts";

/** A tag in the directory: the same shape as a category plus its entry count. */
export type TagItem = CategoryItem & {
  /** Completed transactions carrying the tag in the month. */
  entries: number;
};

/** Tags have no budgets, so only the activity of the month is shown. */
export function buildTagItems(tags: TagWithActivity[]): TagItem[] {
  const items = buildItems(tags);
  return items.map((item, i) => ({ ...item, entries: tags[i].entries }));
}

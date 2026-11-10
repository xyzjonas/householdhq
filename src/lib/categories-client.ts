import { m } from "#paraglide/messages.js";
import type { Category, Tag } from "#lib/server/core/types.ts";

export type CategoryChanges = Partial<
  Pick<Category, "name" | "description" | "icon" | "color">
>;

/** Tags have the same editable properties as categories. */
export type TagChanges = CategoryChanges;

async function patch<T>(url: string, changes: CategoryChanges): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(changes),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      body?.message ?? m.categories_update_failed({ status: res.status }),
    );
  }
  return res.json();
}

/** PATCH a subset of the category's properties; resolves to the saved category. */
export function patchCategory(
  id: number,
  changes: CategoryChanges,
): Promise<Category> {
  return patch(`/api/categories/${id}`, changes);
}

/** PATCH a subset of the tag's properties; resolves to the saved tag. */
export function patchTag(id: number, changes: TagChanges): Promise<Tag> {
  return patch(`/api/tags/${id}`, changes);
}

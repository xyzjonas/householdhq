import type { Category } from "#lib/server/core/types.ts";

export type CategoryChanges = Partial<
  Pick<Category, "name" | "description" | "icon" | "color">
>;

/** PATCH a subset of the category's properties; resolves to the saved category. */
export async function patchCategory(
  id: number,
  changes: CategoryChanges,
): Promise<Category> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(changes),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `Update failed (${res.status})`);
  }
  return res.json();
}

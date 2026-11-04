import type { Account } from "#lib/server/core/types.ts";

export type AccountChanges = Partial<
  Pick<
    Account,
    | "name"
    | "type"
    | "position"
    | "color"
    | "isOut"
    | "isDisponible"
    | "isPortfolio"
  >
>;

/** PATCH a subset of the account's properties; resolves to the saved account. */
export async function patchAccount(
  id: number,
  changes: AccountChanges,
): Promise<Account> {
  const res = await fetch(`/api/accounts/${id}`, {
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

import { getCore } from "#lib/server/index.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const accounts = await getCore().accounts.listWithBalances();
  // "Out" accounts are external (expenses etc.), not part of the household.
  return { accounts: accounts.filter((a) => !a.isOut) };
};

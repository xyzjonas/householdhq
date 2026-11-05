import { fiscalIntervalAt } from "#lib/fiscal-interval.ts";
import { getCore } from "#lib/server/index.ts";
import { availableToSpend } from "#lib/upcoming.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const core = getCore();
  const now = new Date();
  const settings = await core.settings.get();
  const interval = fiscalIntervalAt(now, settings.fiscalIntervalStartDay);

  const [accounts, balances, recent, upcoming] = await Promise.all([
    core.accounts.listWithBalances(),
    core.accounts.balances(),
    // Past transactions are shown regardless of the interval.
    core.transactions.list({ to: new Date(now.getTime() + 1), limit: 20 }),
    // Upcoming ones stop at the end of the current interval.
    core.transactions.upcoming(now, interval.end),
  ]);
  return {
    // "Out" accounts are external (expenses etc.), not part of the household.
    accounts: accounts.filter((a) => !a.isOut),
    balances,
    interval,
    availableToSpend: availableToSpend(balances.liquid, upcoming),
    upcoming,
    transactions: recent.items,
  };
};

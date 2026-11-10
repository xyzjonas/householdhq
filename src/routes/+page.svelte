<script lang="ts">
  import AccountList from "#lib/components/AccountList.svelte";
  import PillarOverview from "#lib/components/accounts/PillarOverview.svelte";
  import BalanceCard from "#lib/components/BalanceCard.svelte";
  import NewRecordCta from "#lib/components/NewRecordCta.svelte";
  import TransactionList from "#lib/components/TransactionList.svelte";
  import { resolve } from "$app/paths";
  import { buildPillars } from "#lib/accounts-view.ts";
  import { formatDate, formatMoney } from "#lib/format.ts";
  import { m } from "#paraglide/messages.js";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const pillars = $derived(buildPillars(data.accounts));

  const UPCOMING_PREVIEW_COUNT = 3;
  let showAllUpcoming = $state(false);
  const visibleUpcoming = $derived(
    showAllUpcoming
      ? data.upcoming
      : data.upcoming.slice(0, UPCOMING_PREVIEW_COUNT),
  );
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <h1 class="sr-only">{m.dashboard_title()}</h1>

  <section
    aria-labelledby="balances-heading"
    class="no-scrollbar -mx-4 flex touch-pan-x snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0"
  >
    <h2 id="balances-heading" class="sr-only">{m.dashboard_balances()}</h2>
    <BalanceCard
      featured
      label={m.dashboard_total_liquid()}
      amount={data.balances.liquid}
      hint={m.dashboard_available_hint({
        amount: formatMoney(data.availableToSpend),
        date: formatDate(data.interval.end),
      })}
    />
    <BalanceCard
      label={m.dashboard_net_worth()}
      amount={data.balances.total}
      hint={m.dashboard_all_owned()}
    />
  </section>

  <NewRecordCta />

  <section
    aria-labelledby="accounts-heading"
    class="flex flex-col gap-5 card border border-surface-200-800 p-4 sm:p-6"
  >
    <header class="flex items-start justify-between gap-3">
      <div>
        <h2
          id="accounts-heading"
          class="text-lg font-extrabold tracking-tight sm:text-xl"
        >
          {m.dashboard_accounts_title()}
        </h2>
        <p class="mt-1 text-xs font-medium text-surface-600-400 sm:text-sm">
          {m.dashboard_accounts_description()}
        </p>
      </div>
      <a
        class="shrink-0 anchor text-sm font-semibold"
        href={resolve("/accounts")}
      >
        {m.dashboard_view_all()}
      </a>
    </header>
    <PillarOverview {pillars} />
    <AccountList accounts={data.accounts.filter((a) => a.isPortfolio)} />
  </section>

  <section aria-labelledby="upcoming-heading" class="flex flex-col gap-4">
    <h2 id="upcoming-heading" class="text-xl font-bold">
      {m.dashboard_upcoming_title({ date: formatDate(data.interval.end) })}
    </h2>
    <TransactionList
      transactions={visibleUpcoming}
      empty={m.dashboard_upcoming_empty()}
    />
    {#if data.upcoming.length > UPCOMING_PREVIEW_COUNT}
      <button
        type="button"
        class="self-start anchor text-sm font-semibold"
        aria-expanded={showAllUpcoming}
        onclick={() => (showAllUpcoming = !showAllUpcoming)}
      >
        {showAllUpcoming
          ? m.dashboard_show_less()
          : m.dashboard_show_more({
              count: data.upcoming.length - UPCOMING_PREVIEW_COUNT,
            })}
      </button>
    {/if}
  </section>

  <section aria-labelledby="transactions-heading" class="flex flex-col gap-4">
    <header class="flex items-baseline justify-between gap-4">
      <h2 id="transactions-heading" class="text-xl font-bold">
        {m.dashboard_recent_title()}
      </h2>
      <a class="anchor text-sm font-semibold" href={resolve("/transactions")}>
        {m.dashboard_view_all()}
      </a>
    </header>
    <TransactionList transactions={data.transactions} />
  </section>
</div>

<style scoped>
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>

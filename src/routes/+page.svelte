<script lang="ts">
  import AccountList from "#lib/components/AccountList.svelte";
  import PillarOverview from "#lib/components/accounts/PillarOverview.svelte";
  import BalanceCard from "#lib/components/BalanceCard.svelte";
  import TransactionList from "#lib/components/TransactionList.svelte";
  import { resolve } from "$app/paths";
  import { buildPillars } from "#lib/accounts-view.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const pillars = $derived(buildPillars(data.accounts));
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <h1 class="sr-only">Dashboard</h1>

  <section aria-labelledby="balances-heading" class="grid gap-4 sm:grid-cols-2">
    <h2 id="balances-heading" class="sr-only">Balances</h2>
    <BalanceCard
      featured
      label="Total liquid balance"
      amount={data.balances.liquid}
      hint="Available to spend"
    />
    <BalanceCard
      label="Household net worth"
      amount={data.balances.total}
      hint="All owned accounts"
    />
  </section>

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
          Accounts
        </h2>
        <p class="mt-1 text-xs font-medium text-surface-600-400 sm:text-sm">
          Distribution across transaction rails, cash, savings and investments
        </p>
      </div>
      <a
        class="shrink-0 anchor text-sm font-semibold"
        href={resolve("/accounts")}
      >
        View all
      </a>
    </header>
    <PillarOverview {pillars} />
    <AccountList accounts={data.accounts.filter((a) => a.isPortfolio)} />
  </section>

  <section aria-labelledby="transactions-heading" class="flex flex-col gap-4">
    <h2 id="transactions-heading" class="text-xl font-bold">
      Recent transactions
    </h2>
    <TransactionList transactions={data.transactions} />
  </section>
</div>

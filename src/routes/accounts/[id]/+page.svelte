<script lang="ts">
  import { resolve } from "$app/paths";
  import AccountProperties from "#lib/components/accounts/detail/AccountProperties.svelte";
  import BalanceHero from "#lib/components/accounts/detail/BalanceHero.svelte";
  import EntriesLedger from "#lib/components/accounts/detail/EntriesLedger.svelte";
  import LiquidityChart from "#lib/components/accounts/detail/LiquidityChart.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.account.name} · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-col gap-2">
    <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
      <ol class="flex gap-2">
        <li><a class="anchor" href={resolve("/")}>Home</a></li>
        <li aria-hidden="true">›</li>
        <li><a class="anchor" href={resolve("/accounts")}>Accounts</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">{data.account.id} ({data.account.name})</li>
      </ol>
    </nav>
    <h1
      class="flex flex-wrap items-center gap-3 text-2xl font-extrabold tracking-tight"
    >
      <span
        class="size-3 rounded-full bg-emerald-600"
        style:background-color={data.account.color}
        aria-hidden="true"
      ></span>
      {data.account.name}
      <span
        class="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-800 uppercase"
      >
        {data.account.type.toLowerCase()}
      </span>
    </h1>
  </header>

  <div class="grid gap-6 lg:grid-cols-2">
    <BalanceHero
      balance={data.balance}
      delta={data.delta}
      disponible={data.account.isDisponible}
      projectedMonthEnd={data.projectedMonthEnd}
    />
    <LiquidityChart trajectory={data.trajectory} />
  </div>

  {#key data.account.id}
    <AccountProperties account={data.account} />
  {/key}

  <EntriesLedger
    accountId={data.account.id}
    accountName={data.account.name}
    entries={data.entries}
    total={data.total}
    categories={data.categories}
    filters={data.filters}
  />
</div>

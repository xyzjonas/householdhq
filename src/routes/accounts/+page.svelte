<script lang="ts">
  import { resolve } from "$app/paths";
  import AccountDirectory from "#lib/components/accounts/AccountDirectory.svelte";
  import PillarAllocation from "#lib/components/accounts/PillarAllocation.svelte";
  import { buildPillars } from "#lib/accounts-view.ts";
  import { formatMoney } from "#lib/format.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const pillars = $derived(buildPillars(data.accounts));
  const netWorth = $derived(data.accounts.reduce((s, a) => s + a.balance, 0));
</script>

<svelte:head><title>Accounts · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <header class="flex flex-col gap-2">
    <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
      <ol class="flex gap-2">
        <li><a class="anchor" href={resolve("/")}>Home</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">Accounts ({data.accounts.length} total)</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-extrabold tracking-tight">
      Institutional accounts & vaults
    </h1>
  </header>

  <section
    aria-labelledby="net-worth-heading"
    class="flex flex-col gap-1 card border border-surface-200-800 p-6"
  >
    <h2
      id="net-worth-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      Aggregated household net worth
    </h2>
    <p class="text-3xl font-extrabold tracking-tight md:text-4xl">
      {formatMoney(netWorth)}
    </p>
  </section>

  <PillarAllocation {pillars} />
  <AccountDirectory accounts={data.accounts} />
</div>

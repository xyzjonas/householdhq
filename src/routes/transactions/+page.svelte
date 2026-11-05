<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import LedgerPagination from "#lib/components/ledger/LedgerPagination.svelte";
  import TransactionFilters from "#lib/components/transactions/TransactionFilters.svelte";
  import TransactionList from "#lib/components/TransactionList.svelte";
  import { viewQuery } from "#lib/transactions-view.ts";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const first = $derived(
    data.total === 0 ? 0 : (data.view.page - 1) * data.view.size + 1,
  );
  const last = $derived(Math.min(data.total, data.view.page * data.view.size));

  const toPage = (page: number) =>
    goto(resolve(`/transactions?${viewQuery(data.view, { page })}`));
</script>

<svelte:head><title>Transactions · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-col gap-2">
    <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
      <ol class="flex gap-2">
        <li><a class="anchor" href={resolve("/")}>Home</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">Transactions</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-extrabold tracking-tight">Transactions</h1>
  </header>

  <TransactionFilters
    view={data.view}
    categories={data.categories}
    accounts={data.accounts}
    tags={data.tags}
  />

  <section aria-labelledby="results-heading" class="flex flex-col gap-4">
    <h2 id="results-heading" class="text-sm font-semibold text-surface-600-400">
      {#if data.total === 0}
        No transactions found
      {:else}
        Showing {first} to {last} of {data.total} transactions
      {/if}
    </h2>

    <TransactionList
      transactions={data.transactions}
      empty="No transactions match these filters."
    />

    {#if data.total > data.view.size}
      <footer class="flex justify-center">
        <LedgerPagination
          total={data.total}
          pageSize={data.view.size}
          page={data.view.page}
          onpage={toPage}
        />
      </footer>
    {/if}
  </section>
</div>

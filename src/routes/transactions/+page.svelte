<script lang="ts">
  import { m } from "#paraglide/messages.js";
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
    goto(resolve(`/transactions?${viewQuery(data.view, { page })}`), {
      // Paging, not a navigation: keep scroll position and focus.
      reset: false,
    });
</script>

<svelte:head
  ><title>{m.transactions_page_title()} · {m.common_app_name()}</title
  ></svelte:head
>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <header class="flex flex-col gap-2">
    <nav
      aria-label={m.common_breadcrumb()}
      class="text-sm text-surface-600-400"
    >
      <ol class="flex gap-2">
        <li><a class="anchor" href={resolve("/")}>{m.common_home()}</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">{m.transactions_page_title()}</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-extrabold tracking-tight">
      {m.transactions_page_title()}
    </h1>
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
        {m.transactions_results_none()}
      {:else}
        {m.transactions_results_range({ first, last, total: data.total })}
      {/if}
    </h2>

    <TransactionList
      transactions={data.transactions}
      empty={m.transactions_empty_filtered()}
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

<script lang="ts">
  import { goto } from "$app/navigation";
  import Plus from "@lucide/svelte/icons/plus";
  import Search from "@lucide/svelte/icons/search";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { resolve } from "$app/paths";
  import {
    PAGE_SIZE,
    flowOf,
    signedAmount,
    type DetailView,
  } from "#lib/category-detail.ts";
  import { formatDate, formatMoney } from "#lib/format.ts";
  import { monthLabel } from "#lib/categories-view.ts";
  import DeleteEntryDialog from "#lib/components/ledger/DeleteEntryDialog.svelte";
  import EntryStatusBadge from "#lib/components/ledger/EntryStatusBadge.svelte";
  import LedgerPagination from "#lib/components/ledger/LedgerPagination.svelte";
  import type { TransactionWithRelations } from "#lib/server/core/types.ts";

  let {
    categoryId,
    categoryName,
    entries,
    total,
    view,
    queryFor,
  }: {
    categoryId: number;
    categoryName: string;
    entries: TransactionWithRelations[];
    total: number;
    view: DetailView;
    /** Query string of this view with some fields replaced. */
    queryFor: (changes: Partial<DetailView>) => string;
  } = $props();

  let deleting = $state<TransactionWithRelations | null>(null);

  const first = $derived(total === 0 ? 0 : (view.page - 1) * PAGE_SIZE + 1);
  const last = $derived(Math.min(total, view.page * PAGE_SIZE));
  const scope = $derived(view.all ? "all time" : monthLabel(view.month));

  const go = (changes: Partial<DetailView>) =>
    goto(
      resolve(`/categories/[id]?${queryFor(changes)}`, {
        id: String(categoryId),
      }),
    );
</script>

<section
  aria-labelledby="entries-heading"
  class="flex flex-col gap-5 card border border-surface-200-800 p-6"
>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h2
        id="entries-heading"
        class="flex items-center gap-2 text-lg font-bold"
      >
        Entries
        <span
          class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800"
        >
          {total} recorded
        </span>
      </h2>
      <p class="text-sm text-surface-600-400">
        {categoryName} transactions · {scope}
      </p>
    </div>

    <form
      role="search"
      method="GET"
      class="flex flex-wrap items-center gap-3"
      onsubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        go({ search: typeof q === "string" ? q.trim() : "" });
      }}
    >
      <label class="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          class="checkbox"
          checked={view.all}
          onchange={(e) => go({ all: e.currentTarget.checked })}
        />
        All time
      </label>
      <div class="field-group grid-cols-[auto_1fr]">
        <span class="label preset-tonal">
          <Search size={16} aria-hidden="true" />
        </span>
        <input
          class="input"
          type="search"
          name="q"
          placeholder="Search entries"
          aria-label="Search entries"
          value={view.search}
        />
      </div>
      <a
        href={resolve("/transactions/new")}
        class="btn rounded-full bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
      >
        <Plus size={16} aria-hidden="true" />
        <span>Add entry</span>
      </a>
    </form>
  </header>

  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left">
      <thead>
        <tr
          class="border-b border-surface-200-800 text-[11px] tracking-wider text-surface-500 uppercase"
        >
          <th scope="col" class="pb-3 font-bold">Date</th>
          <th scope="col" class="pb-3 font-bold">Description</th>
          <th scope="col" class="pb-3 text-right font-bold">Amount</th>
          <th scope="col" class="pb-3 pl-4 font-bold">Status</th>
          <th scope="col" class="pb-3 text-right font-bold">
            <span class="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each entries as t (t.id)}
          {@const amount = signedAmount(t)}
          <tr class="border-b border-surface-100-900 last:border-0">
            <td class="py-3 pr-4 text-xs font-medium whitespace-nowrap">
              <time datetime={t.transactedAt?.toISOString()}>
                {formatDate(t.transactedAt)}{view.all && t.transactedAt
                  ? ` ${t.transactedAt.getFullYear()}`
                  : ""}
              </time>
            </td>
            <td class="py-3 pr-4">
              <p class="text-sm font-bold">{t.description}</p>
              <p class="text-xs text-surface-500">
                {t.source.name} → {t.target.name}
              </p>
            </td>
            <td
              class="py-3 text-right text-sm font-bold whitespace-nowrap tabular-nums {flowOf(
                t,
              ) === 'received'
                ? 'text-emerald-600'
                : ''}"
            >
              {amount > 0 ? "+" : ""}{formatMoney(amount, t.currency)}
            </td>
            <td class="py-3 pl-4"><EntryStatusBadge entry={t} /></td>
            <td class="py-3 text-right whitespace-nowrap">
              <button
                type="button"
                class="btn-icon btn-icon-sm hover:preset-tonal-error"
                aria-label="Delete {t.description}"
                onclick={() => (deleting = t)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="5" class="py-8 text-center text-sm opacity-70">
              No entries match these filters.
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <footer
    class="flex flex-wrap items-center justify-between gap-3 text-sm text-surface-600-400"
  >
    <p>Showing {first} to {last} of {total} entries</p>
    <LedgerPagination
      {total}
      pageSize={PAGE_SIZE}
      page={view.page}
      onpage={(page) => go({ page })}
    />
  </footer>
</section>

<DeleteEntryDialog bind:entry={deleting} />

<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { SvelteURLSearchParams } from "svelte/reactivity";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Plus from "@lucide/svelte/icons/plus";
  import Search from "@lucide/svelte/icons/search";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { PAGE_SIZE, signedFor } from "#lib/account-detail.ts";
  import { formatDate, formatMoney } from "#lib/format.ts";
  import DeleteEntryDialog from "#lib/components/ledger/DeleteEntryDialog.svelte";
  import EntryStatusBadge from "#lib/components/ledger/EntryStatusBadge.svelte";
  import LedgerPagination from "#lib/components/ledger/LedgerPagination.svelte";
  import CheckpointRow from "#lib/components/ledger/CheckpointRow.svelte";
  import CheckpointDialog from "./CheckpointDialog.svelte";
  import type {
    LedgerEntry,
    TransactionWithRelations,
  } from "#lib/server/core/types.ts";

  let {
    accountId,
    accountName,
    entries,
    suggestedCheckpoint,
    total,
    categories,
    filters,
  }: {
    accountId: number;
    accountName: string;
    entries: LedgerEntry[];
    suggestedCheckpoint: number;
    total: number;
    categories: { id: number; name: string }[];
    filters: {
      month: string;
      categoryId?: number;
      search: string;
      page: number;
    };
  } = $props();

  let deleting = $state<TransactionWithRelations | null>(null);

  const first = $derived(total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1);
  const last = $derived(Math.min(total, filters.page * PAGE_SIZE));

  /** Query string for this view with some filters replaced (page resets by default). */
  function query(changes: Record<string, string | number | undefined>) {
    const params = new SvelteURLSearchParams();
    const next: Record<string, string | number | undefined> = {
      month: filters.month,
      category: filters.categoryId,
      q: filters.search || undefined,
      page: undefined,
      ...changes,
    };
    for (const [k, v] of Object.entries(next)) {
      if (v !== undefined && v !== "") params.set(k, String(v));
    }
    return params.toString();
  }

  const go = (changes: Record<string, string | number | undefined>) =>
    goto(
      resolve(`/accounts/[id]?${query(changes)}`, { id: String(accountId) }),
    );

  function counterparty(t: TransactionWithRelations) {
    return t.sourceId === accountId ? t.target.name : t.source.name;
  }
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
        Chronological transaction journal for {accountName}
      </p>
    </div>

    <form
      role="search"
      method="GET"
      class="flex flex-wrap items-center gap-3"
      onsubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        go({ q: typeof q === "string" ? q.trim() : undefined });
      }}
    >
      <input
        class="input w-auto"
        type="month"
        aria-label="Period"
        value={filters.month}
        onchange={(e) =>
          e.currentTarget.value && go({ month: e.currentTarget.value })}
      />
      <select
        class="select w-auto"
        aria-label="Category"
        value={filters.categoryId ?? ""}
        onchange={(e) => go({ category: e.currentTarget.value || undefined })}
      >
        <option value="">All categories</option>
        {#each categories as c (c.id)}
          <option value={c.id}>{c.name}</option>
        {/each}
      </select>
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
          value={filters.search}
        />
      </div>
      <CheckpointDialog {accountName} suggested={suggestedCheckpoint} />
      <a
        href={resolve(`/transactions/new?account=${accountId}`)}
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
          <th scope="col" class="pb-3 font-bold">Category</th>
          <th scope="col" class="pb-3 text-right font-bold">Amount</th>
          <th scope="col" class="pb-3 pl-4 font-bold">Status</th>
          <th scope="col" class="pb-3 text-right font-bold">
            <span class="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each entries as entry (entry.kind === "checkpoint" ? `c${entry.checkpoint.id}` : `t${entry.transaction.id}`)}
          {#if entry.kind === "checkpoint"}
            <CheckpointRow checkpoint={entry.checkpoint} />
          {:else}
            {@const t = entry.transaction}
            {@const amount = signedFor(t, accountId)}
            <tr class="border-b border-surface-100-900 last:border-0">
              <td class="py-3 pr-4 text-xs font-medium whitespace-nowrap">
                <time datetime={t.transactedAt?.toISOString()}>
                  {formatDate(t.transactedAt)}
                </time>
              </td>
              <td class="py-3 pr-4">
                <p class="text-sm font-bold">{t.description}</p>
                <p class="text-xs text-surface-500">{counterparty(t)}</p>
              </td>
              <td class="py-3 pr-4 text-xs font-semibold">
                {#if t.category}
                  <span class="badge preset-tonal">{t.category.name}</span>
                {/if}
              </td>
              <td
                class="py-3 text-right text-sm font-bold whitespace-nowrap tabular-nums"
              >
                {amount > 0 ? "+" : ""}{formatMoney(amount, t.currency)}
              </td>
              <td class="py-3 pl-4"><EntryStatusBadge entry={t} /></td>
              <td class="py-3 text-right whitespace-nowrap">
                <a
                  href={resolve("/transactions/[id]/edit", {
                    id: String(t.id),
                  })}
                  class="btn-icon btn-icon-sm hover:preset-tonal"
                  aria-label="Edit {t.description}"
                >
                  <Pencil size={16} aria-hidden="true" />
                </a>
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
          {/if}
        {:else}
          <tr>
            <td colspan="6" class="py-8 text-center text-sm opacity-70">
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
      page={filters.page}
      onpage={(page) => go({ page })}
    />
  </footer>
</section>

<DeleteEntryDialog bind:entry={deleting} />

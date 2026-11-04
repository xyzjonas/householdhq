<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { SvelteURLSearchParams } from "svelte/reactivity";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Plus from "@lucide/svelte/icons/plus";
  import Search from "@lucide/svelte/icons/search";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { PAGE_SIZE, signedFor } from "#lib/account-detail.ts";
  import { formatDate, formatMoney } from "#lib/format.ts";
  import type { TransactionWithRelations } from "#lib/server/core/types.ts";

  let {
    accountId,
    accountName,
    entries,
    total,
    categories,
    filters,
  }: {
    accountId: number;
    accountName: string;
    entries: TransactionWithRelations[];
    total: number;
    categories: { id: number; name: string }[];
    filters: {
      month: string;
      categoryId?: number;
      search: string;
      page: number;
    };
  } = $props();

  let confirming = $state<number | null>(null);

  const pages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));
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
        {#each entries as t (t.id)}
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
            <td class="py-3 pl-4">
              <span
                class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold {t.cancelled
                  ? 'bg-red-50 text-red-700'
                  : t.confirmed
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-amber-50 text-amber-700'}"
              >
                {t.cancelled
                  ? "Cancelled"
                  : t.confirmed
                    ? "Completed"
                    : "Pending"}
              </span>
            </td>
            <td class="py-3 text-right whitespace-nowrap">
              {#if confirming === t.id}
                <form
                  method="POST"
                  action="?/delete"
                  class="inline-flex items-center gap-2"
                  use:enhance={() =>
                    async ({ update }) => {
                      confirming = null;
                      await update();
                    }}
                >
                  <input type="hidden" name="id" value={t.id} />
                  <span class="text-xs">Delete?</span>
                  <button
                    type="submit"
                    class="btn preset-filled-error-500 text-xs btn-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    class="btn preset-tonal text-xs btn-sm"
                    onclick={() => (confirming = null)}
                  >
                    Cancel
                  </button>
                </form>
              {:else}
                <button
                  type="button"
                  class="btn-icon btn-icon-sm hover:preset-tonal-error"
                  aria-label="Delete {t.description}"
                  onclick={() => (confirming = t.id)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              {/if}
            </td>
          </tr>
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
    <nav aria-label="Pagination" class="flex items-center gap-2">
      <button
        type="button"
        class="btn preset-tonal btn-sm"
        disabled={filters.page <= 1}
        onclick={() => go({ page: filters.page - 1 })}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Previous
      </button>
      <span
        class="rounded-full preset-filled-surface-950-50 px-3 py-1 text-xs font-bold"
      >
        {filters.page} / {pages}
      </span>
      <button
        type="button"
        class="btn preset-tonal btn-sm"
        disabled={filters.page >= pages}
        onclick={() => go({ page: filters.page + 1 })}
      >
        Next
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  </footer>
</section>

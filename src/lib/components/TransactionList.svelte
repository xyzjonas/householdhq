<script lang="ts">
  import { enhance } from "$app/forms";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { formatDate, formatMoney } from "#lib/format.ts";
  import type { TransactionWithRelations } from "#lib/server/core/types.ts";

  let { transactions }: { transactions: TransactionWithRelations[] } = $props();

  /** Money leaving an owned account is negative, money arriving positive. */
  function signed(t: TransactionWithRelations): number {
    if (t.target.isOut && !t.source.isOut) return -t.amount;
    if (t.source.isOut && !t.target.isOut) return t.amount;
    return t.amount;
  }
</script>

<ul class="flex flex-col gap-2">
  {#each transactions as t (t.id)}
    {@const amount = signed(t)}
    <li class="flex items-center gap-4 card border border-surface-200-800 p-4">
      <div class="min-w-0 flex-1">
        <h3 class="truncate font-semibold">{t.description}</h3>
        <p class="flex flex-wrap items-center gap-2 text-sm opacity-70">
          <time datetime={t.transactedAt?.toISOString()}>
            {formatDate(t.transactedAt)}
          </time>
          {#if t.category}
            <span class="badge preset-tonal">{t.category.name}</span>
          {/if}
          <span>{t.source.name} → {t.target.name}</span>
        </p>
      </div>
      <p
        class="font-bold {amount < 0
          ? 'text-error-600-400'
          : 'text-success-600-400'}"
      >
        {amount > 0 ? "+" : ""}{formatMoney(amount, t.currency)}
      </p>
      <form method="POST" action="?/delete" use:enhance>
        <input type="hidden" name="id" value={t.id} />
        <button
          type="submit"
          class="btn-icon btn-icon-sm hover:preset-tonal-error"
          aria-label="Delete {t.description}"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </form>
    </li>
  {:else}
    <li class="text-sm opacity-70">No transactions yet.</li>
  {/each}
</ul>

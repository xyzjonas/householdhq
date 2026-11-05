<script lang="ts">
  import { resolve } from "$app/paths";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Repeat from "@lucide/svelte/icons/repeat";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import CategoryGlyph from "#lib/components/categories/CategoryGlyph.svelte";
  import { formatDate, formatMoney } from "#lib/format.ts";
  import type { TransactionWithRelations } from "#lib/server/core/types.ts";

  let { transactions }: { transactions: TransactionWithRelations[] } = $props();

  /** Money leaving an owned account is negative, money arriving positive. */
  function signed(t: TransactionWithRelations): number {
    if (t.target.isOut && !t.source.isOut) return -t.amount;
    if (t.source.isOut && !t.target.isOut) return t.amount;
    return t.amount;
  }

  /** "−5 000 Kč" / "+58 200 Kč"; every space is a no-break space. */
  function formatSigned(amount: number, currency: string): string {
    const text = formatMoney(Math.abs(amount), currency);
    const sign = amount < 0 ? "−" : amount > 0 ? "+" : "";
    return `${sign}${text}`.replace(/\s/g, " ");
  }
</script>

<ul class="overflow-hidden card border border-surface-200-800">
  {#each transactions as t (t.id)}
    {@const amount = signed(t)}
    <li
      class="flex items-center gap-2 border-b border-surface-100-900 px-3 py-2 transition-colors duration-150 last:border-b-0 hover:bg-surface-50-950"
    >
      <CategoryGlyph
        icon={t.category?.icon}
        color={t.category?.color}
        compact
      />

      <div class="min-w-0 flex-1">
        <h3 class="flex min-w-0 items-center gap-1.5">
          <span class="truncate text-xs font-bold tracking-tight">
            {t.description}
          </span>
          {#if t.recurring > 0}
            <span
              class="shrink-0 text-surface-500"
              title="Recurring"
              role="img"
              aria-label="Recurring"
            >
              <Repeat size={12} aria-hidden="true" />
            </span>
          {/if}
          {#if t.isImportant}
            <span
              class="shrink-0 text-warning-500"
              title="Important"
              role="img"
              aria-label="Important"
            >
              <TriangleAlert size={12} aria-hidden="true" />
            </span>
          {/if}
        </h3>
        <p
          class="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10.5px] font-medium text-surface-500"
        >
          <time class="shrink-0" datetime={t.transactedAt?.toISOString()}>
            {formatDate(t.transactedAt)}
          </time>
          {#if t.category}
            <span aria-hidden="true" class="text-surface-300">•</span>
            <span
              class="shrink-0 rounded bg-surface-100-900 px-1.5 text-[10px] font-semibold"
            >
              {t.category.name}
            </span>
          {/if}
          <span aria-hidden="true" class="text-surface-300">•</span>
          <span class="truncate">{t.source.name} → {t.target.name}</span>
        </p>
      </div>

      <p
        class="shrink-0 pl-1 text-right text-xs font-extrabold tracking-tight whitespace-nowrap tabular-nums sm:text-sm {amount <
        0
          ? 'text-error-600-400'
          : 'text-success-600-400'}"
      >
        {formatSigned(amount, t.currency)}
      </p>
      <a
        href={resolve("/transactions/[id]/edit", { id: String(t.id) })}
        class="grid size-6 shrink-0 place-items-center rounded-full text-surface-400 transition-colors hover:bg-surface-100-900 hover:text-surface-950-50"
        aria-label="Edit {t.description}"
      >
        <Pencil size={12} aria-hidden="true" />
      </a>
    </li>
  {:else}
    <li class="p-3 text-sm opacity-70">No transactions yet.</li>
  {/each}
</ul>

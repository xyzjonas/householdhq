<script lang="ts">
  import { resolve } from "$app/paths";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Repeat from "@lucide/svelte/icons/repeat";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import TagChips from "#lib/components/tags/TagChips.svelte";
  import Chip from "#lib/components/Chip.svelte";
  import ConfirmTransactionButton from "#lib/components/ConfirmTransactionButton.svelte";
  import CategoryGlyph from "#lib/components/categories/CategoryGlyph.svelte";
  import { formatDateWithYear, formatMoney } from "#lib/format.ts";
  import { m } from "#paraglide/messages.js";
  import type { TransactionWithRelations } from "#lib/server/core/types.ts";

  let {
    transactions,
    empty = m.dashboard_no_transactions(),
  }: {
    transactions: TransactionWithRelations[];
    /** Shown instead of the rows when there are none. */
    empty?: string;
  } = $props();

  const now = new Date();

  /** Pending and already due: waiting for the user to confirm it happened. */
  function isDue(t: TransactionWithRelations): boolean {
    return (
      !t.confirmed && !t.cancelled && !!t.transactedAt && t.transactedAt <= now
    );
  }

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
      class="flex items-center gap-3 border-b border-surface-200-800 px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-surface-500/10"
    >
      {#if t.category}
        <a
          href={resolve("/categories/[id]", { id: String(t.category.id) })}
          class="shrink-0 rounded-full transition-opacity hover:opacity-75"
          aria-label={m.dashboard_open_category({ name: t.category.name })}
          title={t.category.name}
        >
          <CategoryGlyph
            icon={t.category.icon}
            color={t.category.color}
            compact
          />
        </a>
      {:else}
        <CategoryGlyph icon={null} color={null} compact />
      {/if}

      <div class="min-w-0 flex-1">
        <h3 class="flex min-w-0 items-center gap-1.5">
          <span class="truncate text-sm font-bold tracking-tight">
            {t.description}
          </span>
          {#if t.recurring > 0}
            <span
              class="shrink-0 text-surface-500"
              title={m.dashboard_recurring()}
              role="img"
              aria-label={m.dashboard_recurring()}
            >
              <Repeat size={14} aria-hidden="true" />
            </span>
          {/if}
          {#if t.isImportant}
            <span
              class="shrink-0 text-warning-500"
              title={m.dashboard_important()}
              role="img"
              aria-label={m.dashboard_important()}
            >
              <TriangleAlert size={14} aria-hidden="true" />
            </span>
          {/if}
        </h3>
        <p
          class="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-surface-500"
        >
          <time class="shrink-0" datetime={t.transactedAt?.toISOString()}>
            {formatDateWithYear(t.transactedAt)}
          </time>
          {#if t.category}
            <span aria-hidden="true" class="text-surface-300">•</span>
            <Chip>{t.category.name}</Chip>
          {/if}
          <span aria-hidden="true" class="text-surface-300">•</span>
          <span class="min-w-0">{t.source.name} → {t.target.name}</span>
        </p>
        {#if t.tags.length}
          <div class="mt-1.5"><TagChips tags={t.tags} /></div>
        {/if}
      </div>

      <p
        class="shrink-0 pl-1 text-right text-sm font-extrabold tracking-tight whitespace-nowrap tabular-nums sm:text-base {amount <
        0
          ? 'text-error-600-400'
          : 'text-success-600-400'}"
      >
        {formatSigned(amount, t.currency)}
      </p>
      {#if isDue(t)}
        <ConfirmTransactionButton
          id={t.id}
          description={t.description}
          recurring={t.recurring > 0}
        />
      {/if}
      <a
        href={resolve("/transactions/[id]/edit", { id: String(t.id) })}
        class="grid size-8 shrink-0 place-items-center rounded-full text-surface-400 transition-colors hover:bg-surface-500/15 hover:text-surface-950-50"
        aria-label={m.dashboard_edit_transaction({
          description: t.description,
        })}
      >
        <Pencil size={14} aria-hidden="true" />
      </a>
    </li>
  {:else}
    <li class="p-3 text-sm opacity-70">{empty}</li>
  {/each}
</ul>

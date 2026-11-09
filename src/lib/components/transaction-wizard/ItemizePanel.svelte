<script lang="ts">
  import Check from "@lucide/svelte/icons/check";
  import { formatMoney } from "#lib/format.ts";
  import { categoryIcon, fallbackColor } from "./category-icons";
  import type { ItemizeContext, WizardCategory } from "./types";

  let {
    itemize,
    categories,
    amount,
  }: {
    itemize: ItemizeContext;
    categories: WizardCategory[];
    /** The amount currently typed into the calculator. */
    amount: number;
  } = $props();

  const currency = $derived(itemize.parent.currency);
  const saved = $derived(itemize.items.reduce((sum, i) => sum + i.amount, 0));
  /** The receipt's full value: what the original held before any split. */
  const total = $derived(itemize.parent.amount + saved);
  const current = $derived(
    Math.min(Math.max(amount, 0), itemize.parent.amount),
  );
  const left = $derived(
    Math.round((itemize.parent.amount - amount) * 100) / 100,
  );
  const percent = (part: number) => (total > 0 ? (part / total) * 100 : 0);

  const find = (id: number | null) => categories.find((c) => c.id === id);

  const rows = $derived([
    ...itemize.items.map((item) => ({
      ...item,
      category: find(item.categoryId),
      status: "Saved",
    })),
    {
      id: itemize.parent.id,
      amount: itemize.parent.amount,
      description: itemize.parent.description,
      category: find(itemize.parent.categoryId),
      status: "Original",
    },
  ]);
</script>

<section
  aria-label="Receipt allocation"
  class="flex flex-col gap-3 rounded-2xl bg-surface-50-950 p-4"
  style="box-shadow: 0 2px 8px -2px rgb(15 23 42 / 0.05)"
>
  <div class="flex items-end justify-between gap-2">
    <div class="min-w-0">
      <h3
        class="text-xs font-bold tracking-wider text-surface-600-400 uppercase"
      >
        Receipt total
      </h3>
      <p
        class="text-2xl font-extrabold tracking-[-0.03em] break-words text-surface-950-50"
      >
        {formatMoney(total, currency)}
      </p>
    </div>
    <p
      class="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold {left > 0
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}"
      aria-live="polite"
    >
      {#if left > 0}
        Left on original: {formatMoney(left, currency)}
      {:else if left === 0}
        Nothing left on original
      {:else}
        Over by {formatMoney(-left, currency)}
      {/if}
    </p>
  </div>

  <div
    class="flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
    role="img"
    aria-label="{formatMoney(saved, currency)} saved, {formatMoney(
      current,
      currency,
    )} in this item"
  >
    <span
      class="h-full bg-emerald-700 transition-[width]"
      style="width: {percent(saved)}%"
    ></span>
    <span
      class="h-full bg-emerald-400 transition-[width]"
      style="width: {percent(current)}%"
    ></span>
    <span class="h-full flex-1 bg-blue-100 dark:bg-blue-950"></span>
  </div>
  <p
    class="flex justify-between gap-2 text-xs font-medium text-surface-600-400"
  >
    <span
      >Saved: {formatMoney(saved, currency)} ({percent(saved).toFixed(
        1,
      )}%)</span
    >
    <span>This item: {percent(current).toFixed(1)}%</span>
  </p>

  <h3
    class="mt-1 text-xs font-bold tracking-wider text-surface-600-400 uppercase"
  >
    Items
  </h3>
  <ul class="flex flex-col gap-2">
    {#each rows as row (row.id)}
      {@const Icon = categoryIcon(row.category?.icon ?? null)}
      <li
        class="flex items-center gap-3 rounded-xl border border-surface-200-800 p-2"
      >
        <span
          class="rounded-lg p-1.5 text-white"
          style="background-color: {row.category?.color ?? fallbackColor}"
        >
          <Icon size={16} aria-hidden="true" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-xs font-bold text-surface-950-50">
            {row.category?.name ?? "Uncategorised"}
          </span>
          <span class="block truncate text-[11px] text-surface-500">
            {row.description || "No description"}
          </span>
        </span>
        <span class="flex shrink-0 flex-col items-end">
          <span class="text-xs font-bold text-surface-950-50 tabular-nums">
            {formatMoney(row.amount, currency)}
          </span>
          <span
            class="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600"
          >
            {#if row.status === "Saved"}<Check
                size={10}
                aria-hidden="true"
              />{/if}
            {row.status}
          </span>
        </span>
      </li>
    {/each}
  </ul>
</section>

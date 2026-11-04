<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Receipt from "@lucide/svelte/icons/receipt";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { formatMoney } from "#lib/format.ts";
  import {
    evaluate,
    hasOperator,
    press,
    prettyTape,
    type Key,
  } from "./calculator";
  import { categoryIcon, fallbackColor } from "./category-icons";
  import Keypad from "./Keypad.svelte";
  import { currencies, type Currency, type WizardCategory } from "./types";

  let {
    tape = $bindable(),
    currency = $bindable(),
    category,
    onchangecategory,
    onsplit,
  }: {
    tape: string;
    currency: Currency;
    category: WizardCategory | undefined;
    onchangecategory: () => void;
    /** Renders the itemised-split banner when provided. */
    onsplit?: (amount: number) => void;
  } = $props();

  const total = $derived(evaluate(tape));
  const CategoryIcon = $derived(categoryIcon(category?.icon ?? null));

  function cycleCurrency() {
    currency =
      currencies[(currencies.indexOf(currency) + 1) % currencies.length];
  }
</script>

<div class="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
  <div class="flex flex-col gap-4">
    <section
      aria-label="Total value"
      class="rounded-2xl bg-surface-50-950 p-5"
      style="box-shadow: 0 2px 8px -2px rgb(15 23 42 / 0.05)"
    >
      <div class="mb-2 flex items-center justify-between">
        <h3
          class="text-xs font-bold tracking-wider text-surface-600-400 uppercase"
        >
          Total value
        </h3>
        <button
          type="button"
          class="rounded-full bg-surface-100-900 px-3 py-1 text-xs font-bold text-surface-800-200 uppercase active:scale-95"
          onclick={cycleCurrency}
          aria-label="Currency {currency}, tap to change"
        >
          {currency}
        </button>
      </div>
      <div class="flex items-center justify-between gap-2">
        <output
          class="min-w-0 flex-1 text-4xl font-extrabold tracking-[-0.03em] break-all text-surface-950-50"
          aria-live="polite"
        >
          {prettyTape(tape)}
        </output>
        {#if tape !== ""}
          <button
            type="button"
            class="btn-icon size-10 shrink-0 rounded-full preset-tonal"
            aria-label="Clear amount"
            onclick={() => (tape = "")}
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        {/if}
      </div>
      {#if hasOperator(tape)}
        <p class="mt-1 text-sm font-semibold text-surface-600-400">
          = {formatMoney(total, currency)}
        </p>
      {/if}
    </section>

    {#if onsplit}
      <aside
        class="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/40"
      >
        <div class="flex items-center gap-3">
          <span
            class="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
          >
            <Receipt size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 class="text-sm font-bold text-surface-950-50">
              Need itemized split?
            </h3>
            <p class="text-xs text-surface-600-400">
              Divide by friends or sub-items
            </p>
          </div>
        </div>
        <button
          type="button"
          class="rounded-full bg-surface-50-950 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-xs active:scale-95 dark:text-emerald-300"
          onclick={() => onsplit(total)}
        >
          Split ⚡
        </button>
      </aside>
    {/if}

    <button
      type="button"
      class="flex items-center gap-3 rounded-2xl border border-surface-200-800 bg-surface-50-950 p-4 text-left"
      onclick={onchangecategory}
    >
      <span
        class="rounded-xl p-2.5 text-white"
        style="background-color: {category?.color ?? fallbackColor}"
      >
        <CategoryIcon size={20} aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1">
        <span
          class="block text-xs font-semibold tracking-wide text-surface-600-400 uppercase"
        >
          Chosen category
        </span>
        <span class="block truncate font-bold text-surface-950-50">
          {category?.name ?? "Not chosen yet"}
        </span>
      </span>
      <span
        class="flex items-center text-sm font-semibold text-surface-600-400"
      >
        Change <ChevronRight size={16} aria-hidden="true" />
      </span>
    </button>
  </div>

  <Keypad onpress={(key: Key) => (tape = press(tape, key))} />
</div>

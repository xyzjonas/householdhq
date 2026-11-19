<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import {
    budgetStatus,
    consumption,
    monthLabel,
  } from "#lib/categories-view.ts";
  import { formatMoney } from "#lib/format.ts";
  import BudgetBadge from "../BudgetBadge.svelte";
  import BudgetMeter from "../BudgetMeter.svelte";
  import EditBudgetDialog from "./EditBudgetDialog.svelte";

  let {
    name,
    month,
    budget,
    spent,
    message = "",
  }: {
    name: string;
    /** The month in view, `YYYY-MM`. */
    month: string;
    /** Monthly budget; `undefined` when none is set. */
    budget?: number;
    /** Spent in `month`. */
    spent: number;
    message?: string;
  } = $props();

  const pct = $derived(consumption(spent, budget));
  const status = $derived(budgetStatus(pct));
  const remaining = $derived(budget === undefined ? 0 : budget - spent);
</script>

<section
  aria-labelledby="budget-heading"
  class="flex flex-col gap-4 card border border-surface-200-800 p-6"
>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h2
      id="budget-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      {m.budget_card_title({ month: monthLabel(month) })}
    </h2>
    <BudgetBadge {pct} {status} />
  </div>

  {#if budget === undefined}
    <p class="text-sm text-surface-600-400">{m.budget_card_empty()}</p>
  {:else}
    <div class="flex flex-col gap-2">
      <p class="flex flex-wrap items-baseline justify-between gap-x-3">
        <span class="text-2xl font-extrabold tracking-tight tabular-nums">
          {formatMoney(spent)}
        </span>
        <span class="text-sm font-semibold text-slate-500 tabular-nums">
          {m.categories_card_of_budget({ amount: formatMoney(budget) })}
        </span>
      </p>
      <BudgetMeter {pct} {status} />
      <p
        class="text-xs font-medium tabular-nums {status === 'over'
          ? 'text-red-700'
          : 'text-slate-500'}"
      >
        {remaining >= 0
          ? m.budget_card_remaining({ amount: formatMoney(remaining) })
          : m.budget_card_overdrawn({ amount: formatMoney(-remaining) })}
      </p>
    </div>
  {/if}

  <div>
    <EditBudgetDialog {name} {budget} {message} />
  </div>
</section>

<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { formatMoney } from "#lib/format.ts";
  import type { RunRate } from "#lib/categories-view.ts";
  import BudgetMeter from "./BudgetMeter.svelte";

  let { rate, monthLabel }: { rate: RunRate; monthLabel: string } = $props();
</script>

<section
  aria-labelledby="run-rate-heading"
  class="flex flex-col gap-3 card border border-surface-200-800 p-4"
>
  <div class="flex items-start justify-between gap-3">
    <h2
      id="run-rate-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      {m.categories_run_rate({ month: monthLabel })}
    </h2>
    {#if rate.pct !== undefined}
      <p class="text-xs font-bold">
        {m.categories_run_rate_pct({ pct: rate.pct })}
      </p>
    {/if}
  </div>
  <p class="flex items-baseline justify-between gap-3">
    <span class="text-2xl font-extrabold tracking-tight tabular-nums">
      {formatMoney(rate.totalSpent)}
      <span class="text-sm font-semibold opacity-60">
        {m.categories_run_rate_spent()}
      </span>
    </span>
    {#if rate.totalBudget !== undefined}
      <span class="text-xs text-slate-500">
        {m.categories_run_rate_budget({
          amount: formatMoney(rate.totalBudget),
        })}
      </span>
    {/if}
  </p>
  <BudgetMeter
    pct={rate.pct}
    status={rate.status}
    label={m.categories_run_rate_total_used()}
  />
  {#if rate.totalReceived > 0}
    <p class="text-xs text-emerald-600 tabular-nums">
      {m.categories_run_rate_received({
        amount: formatMoney(rate.totalReceived),
      })}
    </p>
  {/if}
</section>

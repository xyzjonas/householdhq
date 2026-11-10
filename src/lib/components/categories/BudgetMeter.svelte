<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import type { BudgetStatus } from "#lib/categories-view.ts";

  let {
    pct,
    status,
    label = m.categories_budget_used(),
  }: {
    /** Share of the budget used; without it nothing is rendered. */
    pct?: number;
    status: BudgetStatus;
    label?: string;
  } = $props();
</script>

{#if pct !== undefined}
  <span
    class="block h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.min(pct, 100)}
  >
    <span
      class="fill block h-full rounded-full transition-all duration-300 {status}"
      style="width: {Math.min(pct, 100)}%"
    ></span>
  </span>
{/if}

<style scoped>
  .fill.ok {
    background-color: #10b981;
  }
  .fill.warn {
    background-color: #f59e0b;
  }
  .fill.over {
    background-color: #ef4444;
  }
</style>

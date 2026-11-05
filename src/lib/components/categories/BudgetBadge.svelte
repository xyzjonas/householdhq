<script lang="ts">
  import type { BudgetStatus } from "#lib/categories-view.ts";

  let { pct, status }: { pct?: number; status: BudgetStatus } = $props();
</script>

{#if pct !== undefined}
  <span class="badge {status}">
    {pct}%{status === "over" ? " over" : ""}
  </span>
{/if}

<style scoped>
  .badge {
    border: 1px solid;
    border-radius: 0.375rem;
    padding: 0.125rem 0.375rem;
    font-size: 11px;
    font-weight: 700;
  }
  .ok {
    background-color: #ecfdf5;
    border-color: #d1fae5;
    color: #047857;
  }
  .warn {
    background-color: #fffbeb;
    border-color: #fef3c7;
    color: #b45309;
  }
  .over {
    background-color: #fff1f2;
    border-color: #ffe4e6;
    color: #be123c;
  }
</style>

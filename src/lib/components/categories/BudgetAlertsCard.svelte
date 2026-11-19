<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import { formatMoney } from "#lib/format.ts";
  import type { BudgetAlert } from "#lib/categories-view.ts";
  import BudgetBadge from "./BudgetBadge.svelte";
  import BudgetMeter from "./BudgetMeter.svelte";

  /** Up to this many alerts are listed one by one, beyond that they are summarised. */
  const LISTED = 2;

  let { alerts }: { alerts: BudgetAlert[] } = $props();

  const categories = $derived(alerts.filter((a) => a.kind === "category"));
  const tags = $derived(alerts.filter((a) => a.kind === "tag"));

  const href = (a: BudgetAlert) =>
    resolve(a.kind === "category" ? "/categories/[id]" : "/tags/[id]", {
      id: String(a.id),
    });
</script>

{#if alerts.length}
  <section
    aria-labelledby="budget-alerts-heading"
    class="flex flex-col gap-3 card border border-surface-200-800 p-4 sm:p-5"
  >
    <h2
      id="budget-alerts-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      {m.dashboard_budget_alerts_title()}
    </h2>

    {#if alerts.length <= LISTED}
      <ul class="flex flex-col gap-4">
        {#each alerts as alert (alert.kind + alert.id)}
          <li class="flex flex-col gap-1.5">
            <p class="flex items-center justify-between gap-3">
              <a
                class="min-w-0 truncate text-sm font-bold hover:underline"
                href={href(alert)}
              >
                {alert.name}
              </a>
              <BudgetBadge pct={alert.pct} status={alert.status} />
            </p>
            <BudgetMeter pct={alert.pct} status={alert.status} />
            <p class="text-xs text-slate-500 tabular-nums">
              {m.dashboard_budget_alerts_amounts({
                spent: formatMoney(alert.spent),
                budget: formatMoney(alert.budget),
              })}
            </p>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-sm font-bold">
        {m.dashboard_budget_alerts_summary({ count: alerts.length })}
      </p>
      <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
        {#if categories.length}
          <li>
            <a class="anchor" href={resolve("/categories")}>
              {m.dashboard_budget_alerts_categories({
                count: categories.length,
              })}
            </a>
          </li>
        {/if}
        {#if tags.length}
          <li>
            <a class="anchor" href={resolve("/tags")}>
              {m.dashboard_budget_alerts_tags({ count: tags.length })}
            </a>
          </li>
        {/if}
      </ul>
    {/if}
  </section>
{/if}

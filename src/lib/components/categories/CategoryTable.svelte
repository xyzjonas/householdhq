<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import { formatMoney } from "#lib/format.ts";
  import type { CategoryItem } from "#lib/categories-view.ts";
  import BudgetBadge from "./BudgetBadge.svelte";
  import BudgetMeter from "./BudgetMeter.svelte";
  import CategoryGlyph from "./CategoryGlyph.svelte";

  let { items, monthLabel }: { items: CategoryItem[]; monthLabel: string } =
    $props();
</script>

<div class="hidden overflow-x-auto card border border-surface-200-800 lg:block">
  <table class="w-full text-left text-sm">
    <caption class="sr-only">
      {m.categories_table_caption({ month: monthLabel })}
    </caption>
    <thead
      class="bg-surface-100-900 text-xs tracking-wider text-surface-600-400 uppercase"
    >
      <tr>
        <th scope="col" class="w-2/5 px-4 py-3 font-bold">
          {m.categories_col_category()}
        </th>
        <th scope="col" class="px-4 py-3 text-right font-bold">
          {m.categories_col_activity()}
        </th>
        <th scope="col" class="px-4 py-3 text-right font-bold">
          {m.categories_col_budget()}
        </th>
        <th scope="col" class="w-1/5 px-4 py-3 font-bold">
          {m.categories_col_consumption()}
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-surface-200-800">
      {#each items as item (item.id)}
        <tr class="relative transition-colors hover:bg-surface-100-900">
          <th scope="row" class="px-4 py-3 font-normal">
            <span class="flex items-center gap-3">
              <CategoryGlyph icon={item.icon} color={item.color} />
              <span class="min-w-0">
                <span class="block truncate text-sm font-bold tracking-tight">
                  <a
                    href={resolve("/categories/[id]", { id: String(item.id) })}
                    class="after:absolute after:inset-0 hover:underline"
                  >
                    {item.name}
                  </a>
                </span>
                {#if item.subtitle}
                  <span class="block truncate text-xs text-slate-400">
                    {item.subtitle}
                  </span>
                {/if}
              </span>
            </span>
          </th>
          <td
            class="px-4 py-3 text-right font-bold tabular-nums {item.isInflow
              ? 'text-emerald-600'
              : 'text-surface-950-50'}"
          >
            {item.isInflow ? "+" : ""}{formatMoney(item.amount)}
          </td>
          <td class="px-4 py-3 text-right text-slate-500 tabular-nums">
            {#if item.budget !== undefined}
              {formatMoney(item.budget)}
            {:else}
              <span
                class="rounded-md bg-surface-100-900 px-1.5 py-0.5 text-[11px] font-semibold text-surface-600-400"
              >
                {m.categories_no_budget()}
              </span>
            {/if}
          </td>
          <td class="px-4 py-3">
            {#if item.consumptionPct !== undefined}
              <span class="flex items-center gap-2">
                <BudgetBadge pct={item.consumptionPct} status={item.status} />
                <BudgetMeter pct={item.consumptionPct} status={item.status} />
              </span>
            {:else}
              <span
                class="text-slate-300"
                aria-label={m.categories_not_applicable()}>–</span
              >
            {/if}
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="4" class="px-4 py-8 text-center text-sm opacity-70">
            {m.categories_none_found()}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

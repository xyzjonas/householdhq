<script lang="ts">
  import { resolve } from "$app/paths";
  import { formatMoney } from "#lib/format.ts";
  import type { CategoryItem } from "#lib/categories-view.ts";
  import BudgetBadge from "./BudgetBadge.svelte";
  import BudgetMeter from "./BudgetMeter.svelte";
  import CategoryGlyph from "./CategoryGlyph.svelte";

  let { items }: { items: CategoryItem[] } = $props();
</script>

<ul class="flex flex-col gap-3 lg:hidden">
  {#each items as item (item.id)}
    <li>
      <article
        class="relative flex min-h-12 flex-col gap-3 card border border-surface-200-800 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <CategoryGlyph icon={item.icon} color={item.color} />
            <div class="min-w-0">
              <h3 class="truncate text-sm font-bold tracking-tight">
                <a
                  href={resolve("/categories/[id]", { id: String(item.id) })}
                  class="after:absolute after:inset-0 hover:underline"
                >
                  {item.name}
                </a>
              </h3>
              <BudgetBadge pct={item.consumptionPct} status={item.status} />
            </div>
          </div>
          <p class="shrink-0 text-right">
            <span
              class="block text-base font-bold tabular-nums {item.isInflow
                ? 'text-emerald-600'
                : 'text-surface-950-50'}"
            >
              {item.isInflow ? "+" : ""}{formatMoney(item.amount)}
            </span>
            {#if item.budget !== undefined}
              <span class="block text-xs text-slate-500 tabular-nums">
                of {formatMoney(item.budget)}
              </span>
            {/if}
          </p>
        </div>
        {#if item.subtitle}
          <p class="text-xs wrap-break-word text-slate-400">{item.subtitle}</p>
        {/if}
        <BudgetMeter pct={item.consumptionPct} status={item.status} />
      </article>
    </li>
  {:else}
    <li class="text-sm opacity-70">No categories found.</li>
  {/each}
</ul>

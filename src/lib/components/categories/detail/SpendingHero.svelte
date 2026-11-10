<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import { formatMoney } from "#lib/format.ts";
  import { resolve } from "$app/paths";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { monthLabel } from "#lib/categories-view.ts";
  import type { DetailView } from "#lib/category-detail.ts";

  let {
    month,
    previousMonth,
    nextMonth,
    route,
    id,
    queryFor,
    spent,
    delta,
    average,
    entryCount,
  }: {
    month: string;
    previousMonth: string;
    nextMonth: string;
    /** The detail page these links point back to. */
    route: "/categories/[id]" | "/tags/[id]";
    id: number;
    /** Query string of this view with some fields replaced. */
    queryFor: (changes: Partial<DetailView>) => string;
    spent: number;
    /** Change versus the previous month; `null` when there is none. */
    delta: number | null;
    average: number;
    entryCount: number;
  } = $props();

  // For spending, an increase is the unwelcome direction.
  const up = $derived((delta ?? 0) > 0);
  const Trend = $derived(up ? TrendingUp : TrendingDown);
</script>

<section
  aria-labelledby="spent-heading"
  class="flex flex-col justify-between gap-6 card border border-surface-200-800 p-6"
>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2
        id="spent-heading"
        class="text-xs font-bold tracking-wider uppercase opacity-60"
      >
        {m.categories_hero_title()}
      </h2>
      <nav
        aria-label={m.categories_hero_month_label()}
        class="flex items-center gap-1"
      >
        <a
          href={resolve(`${route}?${queryFor({ month: previousMonth })}`, {
            id: String(id),
          })}
          class="btn-icon preset-tonal"
          aria-label={m.categories_previous_month({
            month: monthLabel(previousMonth),
          })}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </a>
        <span
          class="min-w-32 text-center text-sm font-bold"
          aria-current="date"
        >
          {monthLabel(month)}
        </span>
        <a
          href={resolve(`${route}?${queryFor({ month: nextMonth })}`, {
            id: String(id),
          })}
          class="btn-icon preset-tonal"
          aria-label={m.categories_next_month({ month: monthLabel(nextMonth) })}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </a>
      </nav>
    </div>
    <p class="text-4xl font-extrabold tracking-tight">
      {formatMoney(spent)}
    </p>
    {#if delta !== null}
      <p>
        <span
          class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold {up
            ? 'border-red-100 bg-red-50 text-red-700'
            : 'border-emerald-100 bg-emerald-50 text-emerald-700'}"
        >
          <Trend size={14} aria-hidden="true" />
          {m.categories_hero_delta({
            amount: `${delta > 0 ? "+" : ""}${formatMoney(delta)}`,
          })}
        </span>
      </p>
    {/if}
  </div>

  <dl
    class="grid grid-cols-2 gap-3 border-t border-surface-200-800 pt-4 text-sm"
  >
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.categories_hero_average()}
      </dt>
      <dd class="font-bold">
        {formatMoney(average)}
        <span class="block text-xs font-medium opacity-60">
          {m.categories_hero_average_hint()}
        </span>
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.categories_hero_entries()}
      </dt>
      <dd class="font-bold">
        {entryCount}
        <span class="block text-xs font-medium opacity-60">
          {m.categories_hero_entries_hint()}
        </span>
      </dd>
    </div>
  </dl>
</section>

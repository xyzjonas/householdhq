<script lang="ts">
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import { formatReading, type MeterStats } from "#lib/energy.ts";
  import type { MeterReading } from "#lib/server/core/types.ts";

  let {
    latest,
    stats,
    unit,
  }: {
    latest: MeterReading | undefined;
    stats: MeterStats;
    unit: string;
  } = $props();

  const monthFmt = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  });
  const updated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const percent = new Intl.NumberFormat("en-GB", {
    style: "percent",
    maximumFractionDigits: 0,
  });

  const lastConsumption = $derived(stats.lastMonth?.consumption ?? null);
  const previousConsumption = $derived(
    stats.sameMonthLastYear?.consumption ?? null,
  );
  const yoy = $derived(stats.yearOverYear);
  // Less consumption is the welcome direction.
  const up = $derived((yoy ?? 0) > 0);
  const Trend = $derived(up ? TrendingUp : TrendingDown);
</script>

<section
  aria-label="Consumption summary"
  class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
>
  <article class="flex flex-col gap-2 card border border-surface-200-800 p-5">
    <h2 class="text-xs font-bold tracking-wider uppercase opacity-60">
      Latest reading
    </h2>
    <p class="text-2xl font-extrabold tracking-tight">
      {latest ? formatReading(latest.value, unit) : "—"}
    </p>
    <p class="text-xs text-surface-600-400">
      {latest ? updated.format(latest.meteredAt) : "No readings yet"}
    </p>
  </article>

  <article class="flex flex-col gap-2 card border border-surface-200-800 p-5">
    <h2 class="text-xs font-bold tracking-wider uppercase opacity-60">
      Last month
    </h2>
    <p class="text-2xl font-extrabold tracking-tight">
      {lastConsumption === null ? "—" : formatReading(lastConsumption, unit)}
    </p>
    <p class="text-xs text-surface-600-400">
      {#if stats.lastMonth && stats.lastMonthPerDay !== null}
        {monthFmt.format(stats.lastMonth.monthStart)} · {formatReading(
          stats.lastMonthPerDay,
          unit,
        )}/day{stats.lastMonth.partial ? " · so far" : ""}
      {:else}
        Needs readings around both ends of the month
      {/if}
    </p>
  </article>

  <article class="flex flex-col gap-2 card border border-surface-200-800 p-5">
    <h2 class="text-xs font-bold tracking-wider uppercase opacity-60">
      Same month last year
    </h2>
    <p class="text-2xl font-extrabold tracking-tight">
      {previousConsumption === null
        ? "—"
        : formatReading(previousConsumption, unit)}
    </p>
    <p class="text-xs">
      {#if yoy !== null}
        <span
          class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold {up
            ? 'border-red-100 bg-red-50 text-red-700'
            : 'border-emerald-100 bg-emerald-50 text-emerald-700'}"
        >
          <Trend size={14} aria-hidden="true" />
          {yoy > 0 ? "+" : ""}{percent.format(yoy)} this year
        </span>
      {:else}
        <span class="text-surface-600-400">No year-ago month to compare</span>
      {/if}
    </p>
  </article>

  <article class="flex flex-col gap-2 card border border-surface-200-800 p-5">
    <h2 class="text-xs font-bold tracking-wider uppercase opacity-60">
      Last 12 months
    </h2>
    <p class="text-2xl font-extrabold tracking-tight">
      {stats.year ? formatReading(stats.year.total, unit) : "—"}
    </p>
    <p class="text-xs text-surface-600-400">
      {#if stats.year}
        {formatReading(stats.year.average, unit)}/month avg · {stats.year
          .months}
        {stats.year.months === 1 ? "month" : "months"} counted
      {:else}
        No complete month yet
      {/if}
    </p>
  </article>
</section>

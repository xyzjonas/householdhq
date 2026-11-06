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
  aria-labelledby="latest-heading"
  class="flex flex-col justify-between gap-6 card border border-surface-200-800 p-6"
>
  <div class="flex flex-col gap-2">
    <h2
      id="latest-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      Latest reading
    </h2>
    <p class="text-4xl font-extrabold tracking-tight">
      {latest ? formatReading(latest.value, unit) : "—"}
    </p>
    <p class="text-sm text-surface-600-400">
      {latest ? `Read ${updated.format(latest.meteredAt)}` : "No readings yet"}
    </p>
    {#if yoy !== null}
      <p>
        <span
          class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold {up
            ? 'border-red-100 bg-red-50 text-red-700'
            : 'border-emerald-100 bg-emerald-50 text-emerald-700'}"
        >
          <Trend size={14} aria-hidden="true" />
          {yoy > 0 ? "+" : ""}{percent.format(yoy)} vs same month last year
        </span>
      </p>
    {/if}
  </div>

  <dl
    class="grid grid-cols-2 gap-3 border-t border-surface-200-800 pt-4 text-sm"
  >
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Last month
      </dt>
      <dd class="font-bold">
        {lastConsumption === null ? "—" : formatReading(lastConsumption, unit)}
        <span class="block text-xs font-medium opacity-60">
          {#if stats.lastMonth && stats.lastMonthPerDay !== null}
            {monthFmt.format(stats.lastMonth.monthStart)} · {formatReading(
              stats.lastMonthPerDay,
              unit,
            )}/day{stats.lastMonth.partial ? " · so far" : ""}
          {:else}
            Needs readings around the month
          {/if}
        </span>
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Same month last year
      </dt>
      <dd class="font-bold">
        {previousConsumption === null
          ? "—"
          : formatReading(previousConsumption, unit)}
        <span class="block text-xs font-medium opacity-60">
          {stats.sameMonthLastYear
            ? monthFmt.format(stats.sameMonthLastYear.monthStart)
            : "No year-ago month yet"}
        </span>
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Last 12 months
      </dt>
      <dd class="font-bold">
        {stats.year ? formatReading(stats.year.total, unit) : "—"}
        <span class="block text-xs font-medium opacity-60">
          {#if stats.year}
            {stats.year.months}
            {stats.year.months === 1 ? "complete month" : "complete months"}
          {:else}
            No complete month yet
          {/if}
        </span>
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Monthly average
      </dt>
      <dd class="font-bold">
        {stats.year ? formatReading(stats.year.average, unit) : "—"}
        <span class="block text-xs font-medium opacity-60">
          Over the same months
        </span>
      </dd>
    </div>
  </dl>
</section>

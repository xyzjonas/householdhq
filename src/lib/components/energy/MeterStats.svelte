<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { intlLocale } from "#lib/i18n.ts";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import {
    formatPercent,
    formatReading,
    type MeterStats,
  } from "#lib/energy.ts";
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

  const monthFmt = $derived(
    new Intl.DateTimeFormat(intlLocale(), { month: "long", year: "numeric" }),
  );
  const updated = $derived(
    new Intl.DateTimeFormat(intlLocale(), {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  );

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
      {m.energy_latest_reading()}
    </h2>
    <p class="text-4xl font-extrabold tracking-tight">
      {latest ? formatReading(latest.value, unit) : "—"}
    </p>
    <p class="text-sm text-surface-600-400">
      {latest
        ? m.energy_read_at({ date: updated.format(latest.meteredAt) })
        : m.energy_no_readings()}
    </p>
    {#if yoy !== null}
      <p>
        <span
          class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold {up
            ? 'border-red-100 bg-red-50 text-red-700'
            : 'border-emerald-100 bg-emerald-50 text-emerald-700'}"
        >
          <Trend size={14} aria-hidden="true" />
          {m.energy_yoy_badge({
            percent: (yoy > 0 ? "+" : "") + formatPercent(yoy),
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
        {m.energy_last_month()}
      </dt>
      <dd class="font-bold">
        {lastConsumption === null ? "—" : formatReading(lastConsumption, unit)}
        <span class="block text-xs font-medium opacity-60">
          {#if stats.lastMonth && stats.lastMonthPerDay !== null}
            {m.energy_last_month_detail({
              month: monthFmt.format(stats.lastMonth.monthStart),
              perDay: formatReading(stats.lastMonthPerDay, unit),
            })}{stats.lastMonth.partial ? ` · ${m.energy_so_far()}` : ""}
          {:else}
            {m.energy_needs_readings()}
          {/if}
        </span>
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.energy_same_month_last_year()}
      </dt>
      <dd class="font-bold">
        {previousConsumption === null
          ? "—"
          : formatReading(previousConsumption, unit)}
        <span class="block text-xs font-medium opacity-60">
          {stats.sameMonthLastYear
            ? monthFmt.format(stats.sameMonthLastYear.monthStart)
            : m.energy_no_year_ago()}
        </span>
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.energy_last_12_months()}
      </dt>
      <dd class="font-bold">
        {stats.year ? formatReading(stats.year.total, unit) : "—"}
        <span class="block text-xs font-medium opacity-60">
          {#if stats.year}
            {m.energy_complete_months({ count: stats.year.months })}
          {:else}
            {m.energy_no_complete_month()}
          {/if}
        </span>
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.energy_monthly_average()}
      </dt>
      <dd class="font-bold">
        {stats.year ? formatReading(stats.year.average, unit) : "—"}
        <span class="block text-xs font-medium opacity-60">
          {m.energy_over_same_months()}
        </span>
      </dd>
    </div>
  </dl>
</section>

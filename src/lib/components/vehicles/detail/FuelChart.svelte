<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { SegmentedControl } from "@skeletonlabs/skeleton-svelte";
  import { areaPath, chartPoints, linePath } from "#lib/account-detail.ts";
  import { chartRanges, type ChartRange } from "#lib/category-detail.ts";
  import { formatNumber } from "#lib/format.ts";
  import { intlLocale } from "#lib/i18n.ts";
  import {
    consumptionSeries,
    distanceByYear,
    fuelChartModes,
    rangeStart,
    unitPrices,
    type ChartPoint,
    type FuelChartMode,
    type ConsumptionFill,
  } from "#lib/vehicle-fuel.ts";

  let {
    entries,
    currency,
    range = $bindable(),
  }: {
    entries: ConsumptionFill[];
    currency: string;
    range: ChartRange;
  } = $props();

  let mode = $state<FuelChartMode>("consumption");

  const W = 480;
  const H = 180;
  const dayFmt = $derived(
    new Intl.DateTimeFormat(intlLocale(), {
      day: "numeric",
      month: "short",
      year: "2-digit",
    }),
  );
  const consumptionFmt = $derived(
    new Intl.NumberFormat(intlLocale(), {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
  );
  const priceFmt = $derived(
    new Intl.NumberFormat(intlLocale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );

  const modes = $derived(fuelChartModes());

  const since = $derived(rangeStart(range));
  const series = $derived.by<ChartPoint[]>(() => {
    if (mode === "price")
      return unitPrices(entries, (d) => dayFmt.format(d), since);
    if (mode === "yearly") return distanceByYear(entries);
    return consumptionSeries(entries, (d) => dayFmt.format(d), since);
  });

  const format = $derived((v: number) =>
    mode === "price"
      ? m.vehicles_chart_price_value({ price: priceFmt.format(v), currency })
      : mode === "consumption"
        ? m.vehicles_chart_consumption_value({
            value: consumptionFmt.format(v),
          })
        : formatNumber(Math.round(v), "km"),
  );

  const points = $derived(
    chartPoints(
      series.map((s) => ({ label: s.label, balance: s.value })),
      W,
      H,
    ),
  );
  const values = $derived(series.map((s) => s.value));
  const min = $derived(Math.min(...values));
  const peak = $derived(Math.max(...values));
  const minPoint = $derived(points[values.indexOf(min)]);
  const peakPoint = $derived(points[values.indexOf(peak)]);
  const last = $derived(points[points.length - 1]);
  const lastValue = $derived(values[values.length - 1]);
  // Dot and label every point while they fit, thin out a long history.
  const dots = $derived(series.length <= 12);
  const every = $derived(Math.max(1, Math.ceil(series.length / 8)));

  const subtitle = $derived(
    mode === "price"
      ? m.vehicles_chart_subtitle_price()
      : mode === "yearly"
        ? m.vehicles_chart_subtitle_yearly()
        : m.vehicles_chart_subtitle_consumption(),
  );
  const ariaLabel = $derived(
    series.length
      ? m.vehicles_chart_aria({
          mode: modes.find((option) => option.id === mode)?.label ?? "",
          from: series[0].label,
          to: series[series.length - 1].label,
          points: series
            .map((s) =>
              m.vehicles_chart_aria_point({
                label: s.label,
                value: format(s.value),
              }),
            )
            .join(", "),
        })
      : m.vehicles_chart_no_data(),
  );
</script>

<section
  aria-labelledby="fuel-chart-heading"
  class="flex flex-col justify-between gap-4 card border border-surface-200-800 p-6"
>
  <header class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 id="fuel-chart-heading" class="text-lg font-bold">
        {m.vehicles_chart_heading()}
      </h2>
      <p class="text-sm text-surface-600-400">{subtitle}</p>
    </div>
    {#if mode !== "yearly"}
      <div
        class="flex gap-1"
        role="group"
        aria-label={m.categories_chart_range_label()}
      >
        {#each chartRanges() as r (r.id)}
          <button
            type="button"
            aria-pressed={r.id === range}
            class="btn rounded-full text-xs btn-sm {r.id === range
              ? 'preset-filled-surface-950-50'
              : 'preset-tonal'}"
            onclick={() => (range = r.id)}
          >
            {r.label}
          </button>
        {/each}
      </div>
    {/if}
  </header>

  {#if series.length}
    <svg
      viewBox="0 0 {W} {H + 20}"
      role="img"
      aria-label={ariaLabel}
      class="w-full text-emerald-700"
    >
      <defs>
        <linearGradient id="fuel-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="currentColor" stop-opacity="0.15" />
          <stop offset="1" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath(points, H - 24)} fill="url(#fuel-fill)" />
      <path
        d={linePath(points)}
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      {#each points as p, i (i)}
        {#if dots}
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="currentColor"
            class="stroke-white dark:stroke-slate-900"
            stroke-width="2"
          />
        {/if}
        {#if i % every === 0}
          <text
            x={p.x}
            y={H + 8}
            text-anchor="middle"
            class="fill-slate-500 text-[11px]"
          >
            {p.label}
          </text>
        {/if}
      {/each}
      {#if peakPoint && peak !== min}
        <text
          x={peakPoint.x}
          y={peakPoint.y - 12}
          text-anchor="middle"
          class="fill-slate-700 text-[11px] font-bold dark:fill-slate-200"
        >
          {format(peak)}
        </text>
      {/if}
      {#if minPoint && last && minPoint !== last && peak !== min}
        <text
          x={minPoint.x}
          y={minPoint.y + 20}
          text-anchor="middle"
          class="fill-slate-500 text-[11px]"
        >
          {format(min)}
        </text>
      {/if}
    </svg>

    <dl class="grid grid-cols-3 gap-3 text-xs">
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">
          {m.vehicles_chart_min()}
        </dt>
        <dd class="text-sm font-bold">{format(min)}</dd>
      </div>
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">
          {m.vehicles_chart_latest()}
        </dt>
        <dd class="text-sm font-bold">{format(lastValue)}</dd>
      </div>
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">
          {m.vehicles_chart_peak()}
        </dt>
        <dd class="text-sm font-bold">{format(peak)}</dd>
      </div>
    </dl>
  {:else}
    <p class="text-sm opacity-70">{m.vehicles_chart_empty()}</p>
  {/if}

  <SegmentedControl
    value={mode}
    onValueChange={(e) => (mode = e.value as FuelChartMode)}
    class="w-full"
  >
    <SegmentedControl.Control class="w-full">
      <SegmentedControl.Indicator />
      {#each modes as option (option.id)}
        <SegmentedControl.Item value={option.id} class="flex-1 justify-center">
          <SegmentedControl.ItemText>{option.label}</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      {/each}
    </SegmentedControl.Control>
  </SegmentedControl>
</section>

<script lang="ts">
  import { areaPath, chartPoints, linePath } from "#lib/account-detail.ts";
  import { formatNumber } from "#lib/format.ts";
  import {
    averageUnitPrice,
    distanceByMonth,
    distanceByYear,
    fuelChartModes,
    odometerGrowth,
    unitPrices,
    type ChartPoint,
    type FuelChartMode,
    type FuelPoint,
  } from "#lib/vehicle-fuel.ts";
  import { fallbackVehicleColor } from "#lib/vehicle-icons.ts";

  let {
    entries,
    color = null,
    currency,
  }: {
    entries: FuelPoint[];
    color?: string | null;
    currency: string;
  } = $props();

  let mode = $state<FuelChartMode>("distance");

  const W = 480;
  const H = 180;
  const monthFmt = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "2-digit",
  });
  const dayFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
  const priceFmt = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const series = $derived.by<ChartPoint[]>(() => {
    if (mode === "price") return unitPrices(entries, (d) => dayFmt.format(d));
    if (mode === "yearly") return distanceByYear(entries);
    return distanceByMonth(entries, (d) => monthFmt.format(d));
  });

  const format = $derived((v: number) =>
    mode === "price"
      ? `${priceFmt.format(v)} ${currency}/L`
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
  // Label at most ~8 points and dot at most ~24 so a long history stays legible.
  const every = $derived(Math.max(1, Math.ceil(series.length / 8)));
  const dots = $derived(series.length <= 24);

  const summary = $derived.by(() => {
    if (mode === "price") {
      return {
        label: "Average unit price",
        value: `${priceFmt.format(averageUnitPrice(entries))} ${currency}/L`,
      };
    }
    if (mode === "yearly") {
      return {
        label: "Total distance",
        value: formatNumber(
          values.reduce((sum, v) => sum + v, 0),
          "km",
        ),
      };
    }
    return {
      label: "Odometer growth",
      value: formatNumber(odometerGrowth(entries), "km"),
    };
  });

  const ariaLabel = $derived(
    series.length
      ? `${fuelChartModes.find((m) => m.id === mode)?.label}: ` +
          series.map((s) => `${s.label} ${format(s.value)}`).join(", ")
      : "No fuel data",
  );
</script>

<section
  aria-labelledby="fuel-chart-heading"
  class="flex flex-col gap-4 card border border-surface-200-800 p-6"
  style="--vehicle: {color ?? fallbackVehicleColor}"
>
  <header class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 id="fuel-chart-heading" class="text-lg font-bold">Fuel statistics</h3>
      <p class="text-sm text-surface-600-400">
        {fuelChartModes.find((m) => m.id === mode)?.label}
      </p>
    </div>
    <div class="flex flex-wrap gap-1" role="group" aria-label="Chart type">
      {#each fuelChartModes as m (m.id)}
        <button
          type="button"
          aria-pressed={m.id === mode}
          class="btn rounded-full text-xs btn-sm {m.id === mode
            ? 'preset-filled-surface-950-50'
            : 'preset-tonal'}"
          onclick={() => (mode = m.id)}
        >
          {m.label}
        </button>
      {/each}
    </div>
  </header>

  {#if series.length > 1}
    <svg
      viewBox="0 0 {W} {H + 20}"
      role="img"
      aria-label={ariaLabel}
      class="w-full text-(--vehicle)"
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
          >
            <title>{p.label}: {format(p.balance)}</title>
          </circle>
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
        <dt class="font-bold tracking-wider uppercase opacity-60">Min</dt>
        <dd class="text-sm font-bold">{format(min)}</dd>
      </div>
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">
          {summary.label}
        </dt>
        <dd class="text-sm font-bold">{summary.value}</dd>
      </div>
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">Peak</dt>
        <dd class="text-sm font-bold">{format(peak)}</dd>
      </div>
    </dl>
  {:else}
    <p class="py-8 text-center text-sm opacity-70">
      Not enough fill-ups to chart yet.
    </p>
  {/if}
</section>

<script lang="ts">
  import { formatNumber } from "#lib/format.ts";
  import {
    averageUnitPrice,
    distanceByMonth,
    distanceByYear,
    fuelChartModes,
    odometerGrowth,
    priceBounds,
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

  const W = 560;
  const H = 220;
  const PAD = { top: 12, right: 12, bottom: 28, left: 52 };
  const monthFmt = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "2-digit",
  });
  const dayFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });

  const points = $derived.by<ChartPoint[]>(() => {
    if (mode === "price") return unitPrices(entries, (d) => dayFmt.format(d));
    if (mode === "yearly") return distanceByYear(entries);
    return distanceByMonth(entries, (d) => monthFmt.format(d));
  });

  /** Distance charts start at their own minimum only for the odometer. */
  const bounds = $derived.by(() => {
    const values = points.map((p) => p.value);
    if (mode === "price") return priceBounds(values);
    const max = Math.max(1, ...values);
    return { min: mode === "distance" ? Math.min(...values, max) : 0, max };
  });
  const span = $derived(bounds.max - bounds.min || 1);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left +
    (points.length < 2 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - ((v - bounds.min) / span) * plotH;

  const line = $derived(
    points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" "),
  );
  const ticks = $derived([0, 0.5, 1].map((t) => bounds.min + span * t));
  const barW = $derived(
    Math.max(8, Math.min(48, (plotW / Math.max(points.length, 1)) * 0.6)),
  );
  // Label at most ~7 points so a long history stays legible.
  const every = $derived(Math.max(1, Math.ceil(points.length / 7)));

  const priceFmt = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const axisFormat = (v: number) =>
    mode === "price" ? priceFmt.format(v) : formatNumber(Math.round(v));

  const summary = $derived.by(() => {
    if (mode === "price") {
      return {
        label: "Average unit price (all fill-ups)",
        value: `${priceFmt.format(averageUnitPrice(entries))} ${currency}/L`,
      };
    }
    if (mode === "yearly") {
      return {
        label: "Total yearly distance",
        value: formatNumber(
          points.reduce((sum, p) => sum + p.value, 0),
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
    `${fuelChartModes.find((m) => m.id === mode)?.label}: ` +
      points.map((p) => `${p.label} ${axisFormat(p.value)}`).join(", "),
  );
</script>

<section
  aria-labelledby="fuel-chart-heading"
  class="flex flex-col gap-4 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-4"
  style="--vehicle: {color ?? fallbackVehicleColor}"
>
  <header class="flex flex-wrap items-center justify-between gap-3">
    <h3 id="fuel-chart-heading" class="text-sm font-bold">Fuel statistics</h3>
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

  {#if points.length}
    <svg
      viewBox="0 0 {W} {H}"
      role="img"
      aria-label={ariaLabel}
      class="w-full text-(--vehicle)"
    >
      {#each ticks as t (t)}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={y(t)}
          y2={y(t)}
          class="stroke-surface-300-700"
          stroke-width="1"
          stroke-dasharray="3 4"
        />
        <text
          x={PAD.left - 8}
          y={y(t) + 4}
          text-anchor="end"
          class="fill-slate-500 text-[11px]"
        >
          {axisFormat(t)}
        </text>
      {/each}

      {#if mode === "yearly"}
        {#each points as p, i (p.label)}
          <rect
            x={x(i) - barW / 2}
            y={y(p.value)}
            width={barW}
            height={Math.max(0, PAD.top + plotH - y(p.value))}
            rx="3"
            fill="currentColor"
          >
            <title>{p.label}: {formatNumber(p.value, "km")}</title>
          </rect>
        {/each}
      {:else}
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        {#each points as p, i (i)}
          <circle cx={x(i)} cy={y(p.value)} r="3" fill="currentColor">
            <title>
              {p.label}: {mode === "price"
                ? `${axisFormat(p.value)} ${currency}/L`
                : formatNumber(Math.round(p.value), "km")}
            </title>
          </circle>
        {/each}
      {/if}

      {#each points as p, i (i)}
        {#if i % every === 0}
          <text
            x={x(i)}
            y={H - 8}
            text-anchor="middle"
            class="fill-slate-500 text-[11px]"
          >
            {p.label}
          </text>
        {/if}
      {/each}
    </svg>
  {:else}
    <p class="py-8 text-center text-sm opacity-70">
      Not enough fill-ups to chart yet.
    </p>
  {/if}

  <p class="flex items-baseline justify-between gap-2">
    <span class="text-xs font-bold tracking-wider uppercase opacity-60">
      {summary.label}
    </span>
    <strong class="text-base">{summary.value}</strong>
  </p>
</section>

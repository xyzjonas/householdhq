<script lang="ts">
  import { resolve } from "$app/paths";
  import {
    chartModes,
    formatReading,
    incrementSeries,
    readingSeries,
    type ChartMode,
  } from "#lib/energy.ts";
  import type { MeterReading } from "#lib/server/core/types.ts";

  let {
    readings,
    unit,
    color,
    mode,
    meterId,
  }: {
    /** Newest first. */
    readings: MeterReading[];
    unit: string;
    color: string;
    mode: ChartMode;
    meterId: number;
  } = $props();

  const W = 480;
  const H = 180;
  const PAD = 8;
  const labelFmt = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "2-digit",
  });
  const fullFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

  const series = $derived(
    mode === "increments" ? incrementSeries(readings) : readingSeries(readings),
  );
  const peak = $derived(Math.max(0, ...series.map((p) => p.value)));
  // The cumulative counter starts anywhere; zooming to its range shows the slope.
  const floor = $derived(
    mode === "readings" && series.length
      ? Math.min(...series.map((p) => p.value))
      : 0,
  );
  const span = $derived(peak - floor || 1);
  const step = $derived((W - PAD * 2) / Math.max(series.length, 1));
  const points = $derived(
    series.map((p, i) => ({
      cx: PAD + i * step + step / 2,
      y:
        H -
        ((p.value - floor) / span) * (H - 24) -
        (mode === "readings" ? 8 : 0),
      h: ((p.value - floor) / span) * (H - 24),
      label: labelFmt.format(p.at),
      full: fullFmt.format(p.at),
      text: formatReading(p.value, unit),
    })),
  );
  const barWidth = $derived(Math.max(1, Math.min(32, step * 0.7)));
  const line = $derived(points.map((p) => `${p.cx},${p.y}`).join(" "));
  const area = $derived(
    points.length
      ? `${points[0].cx},${H} ${line} ${points[points.length - 1].cx},${H}`
      : "",
  );
  const every = $derived(Math.max(1, Math.ceil(series.length / 8)));
  const ariaLabel = $derived(
    series.length
      ? `${mode === "increments" ? "Consumption" : "Readings"}: ` +
          points.map((p) => `${p.full} ${p.text}`).join(", ")
      : "No chart data",
  );
</script>

<section
  aria-labelledby="energy-chart-heading"
  class="flex flex-col justify-between gap-4 card border border-surface-200-800 p-6"
  style="--meter: {color}"
>
  <header class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 id="energy-chart-heading" class="text-lg font-bold">
        {mode === "increments" ? "Consumption" : "Readings"} history
      </h2>
      <p class="text-sm text-surface-600-400">
        {mode === "increments"
          ? "Consumed between consecutive readings"
          : "The counter as read, in " + unit}
      </p>
    </div>
    <nav aria-label="Chart mode" class="flex gap-1">
      {#each chartModes as m (m.id)}
        <a
          href={resolve(
            m.id === "increments"
              ? "/energy/[id]"
              : "/energy/[id]?view=readings",
            { id: String(meterId) },
          )}
          data-sveltekit-reset="false"
          aria-current={m.id === mode ? "true" : undefined}
          class="btn rounded-full text-xs btn-sm {m.id === mode
            ? 'preset-filled-surface-950-50'
            : 'preset-tonal'}"
        >
          {m.label}
        </a>
      {/each}
    </nav>
  </header>

  {#if series.length}
    <svg
      viewBox="0 0 {W} {H + 20}"
      role="img"
      aria-label={ariaLabel}
      class="w-full"
    >
      {#if mode === "increments"}
        {#each points as p, i (i)}
          <rect
            x={p.cx - barWidth / 2}
            y={H - p.h}
            width={barWidth}
            height={p.h}
            rx="2"
            class="fill-(--meter)"
          >
            <title>{p.full}: {p.text}</title>
          </rect>
        {/each}
      {:else}
        <polygon points={area} class="fill-(--meter) opacity-15" />
        <polyline
          points={line}
          fill="none"
          stroke-width="2"
          stroke-linejoin="round"
          class="stroke-(--meter)"
        />
        {#each points as p, i (i)}
          <circle cx={p.cx} cy={p.y} r="3" class="fill-(--meter)">
            <title>{p.full}: {p.text}</title>
          </circle>
        {/each}
      {/if}
      {#each points as p, i (i)}
        {#if i % every === 0}
          <text
            x={p.cx}
            y={H + 14}
            text-anchor="middle"
            class="fill-slate-500 text-[11px]"
          >
            {p.label}
          </text>
        {/if}
      {/each}
    </svg>
  {:else}
    <p class="text-sm opacity-70">
      {mode === "increments"
        ? "Add at least two readings to see consumption."
        : "No readings recorded yet."}
    </p>
  {/if}
</section>

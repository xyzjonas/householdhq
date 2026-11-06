<script lang="ts">
  import { resolve } from "$app/paths";
  import {
    chartModes,
    formatReading,
    monthKey,
    readingSeries,
    type ChartMode,
    type MonthStat,
  } from "#lib/energy.ts";
  import type { MeterReading } from "#lib/server/core/types.ts";

  let {
    readings,
    months,
    unit,
    color,
    mode,
    meterId,
  }: {
    /** Newest first. */
    readings: MeterReading[];
    /** Monthly consumption, oldest first. */
    months: MonthStat[];
    unit: string;
    color: string;
    mode: ChartMode;
    meterId: number;
  } = $props();

  const W = 480;
  const H = 180;
  const PAD = 8;
  const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const monthYearFmt = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  });
  const fullFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

  interface Bar {
    value: number | null;
    partial: boolean;
    /** The year-before series of the comparison. */
    previous: boolean;
    title: string;
  }
  interface Slot {
    label: string;
    bars: Bar[];
  }

  const byKey = $derived(
    new Map(months.map((m) => [monthKey(m.monthStart), m])),
  );
  const window = $derived(months.slice(-12));

  const slots = $derived<Slot[]>(
    mode === "readings"
      ? []
      : window.map((m) => {
          const bar = (
            stat: MonthStat | undefined,
            previous: boolean,
          ): Bar => ({
            value: stat?.consumption ?? null,
            partial: stat?.partial ?? false,
            previous,
            title: `${monthYearFmt.format(stat?.monthStart ?? m.monthStart)}: ${
              stat?.consumption == null
                ? "no data"
                : formatReading(stat.consumption, unit) +
                  (stat.partial ? " (so far)" : "")
            }`,
          });
          const before = new Date(
            m.monthStart.getFullYear() - 1,
            m.monthStart.getMonth(),
            1,
          );
          return {
            label: monthFmt.format(m.monthStart),
            bars:
              mode === "yoy"
                ? [bar(byKey.get(monthKey(before)), true), bar(m, false)]
                : [bar(m, false)],
          };
        }),
  );

  const series = $derived(mode === "readings" ? readingSeries(readings) : []);
  const values = $derived(
    mode === "readings"
      ? series.map((p) => p.value)
      : slots.flatMap((s) => s.bars.map((b) => b.value ?? 0)),
  );
  const peak = $derived(Math.max(0, ...values));
  // The cumulative counter starts anywhere; zooming to its range shows the slope.
  const floor = $derived(
    mode === "readings" && values.length ? Math.min(...values) : 0,
  );
  const span = $derived(peak - floor || 1);
  const scale = (v: number) => ((v - floor) / span) * (H - 24);

  const count = $derived(mode === "readings" ? series.length : slots.length);
  const step = $derived((W - PAD * 2) / Math.max(count, 1));
  const every = $derived(Math.max(1, Math.ceil(count / 8)));
  const per = $derived(mode === "yoy" ? 2 : 1);
  const barWidth = $derived(Math.max(1, Math.min(32, (step * 0.7) / per)));

  const points = $derived(
    series.map((p, i) => ({
      cx: PAD + i * step + step / 2,
      y: H - scale(p.value) - 8,
      label: monthFmt.format(p.at),
      title: `${fullFmt.format(p.at)}: ${formatReading(p.value, unit)}`,
    })),
  );
  const line = $derived(points.map((p) => `${p.cx},${p.y}`).join(" "));
  const area = $derived(
    points.length
      ? `${points[0].cx},${H} ${line} ${points[points.length - 1].cx},${H}`
      : "",
  );

  const hasData = $derived(
    mode === "readings"
      ? series.length > 0
      : slots.some((s) => s.bars.some((b) => b.value !== null)),
  );
  const ariaLabel = $derived(
    !hasData
      ? "No chart data"
      : mode === "readings"
        ? `Readings: ${points.map((p) => p.title).join(", ")}`
        : `${mode === "yoy" ? "Year over year" : "Monthly"} consumption: ${slots
            .flatMap((s) => s.bars.map((b) => b.title))
            .join(", ")}`,
  );

  const figures = $derived.by(() => {
    if (mode === "readings") {
      return [
        ["Min", series.length ? Math.min(...values) : null],
        ["Latest", series.length ? values[values.length - 1] : null],
        ["Peak", series.length ? peak : null],
      ] as const;
    }
    const current = window.map((m) => m.consumption).filter((v) => v !== null);
    return [
      ["Total", current.length ? current.reduce((a, b) => a + b, 0) : null],
      ["Highest month", current.length ? Math.max(...current) : null],
      ["Latest", current.length ? current[current.length - 1] : null],
    ] as const;
  });

  const heading = {
    monthly: "Monthly consumption",
    yoy: "Year over year",
    readings: "Readings history",
  } as const;
  const description = $derived(
    {
      monthly:
        "Interpolated to calendar months, so irregular readings stay comparable",
      yoy: "Each of the last 12 months next to the same month a year earlier",
      readings: `The counter as read, in ${unit}`,
    }[mode],
  );
  const emptyText = $derived(
    mode === "readings"
      ? "No readings recorded yet."
      : "Add readings spanning at least a full month to see consumption.",
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
        {heading[mode]}
      </h2>
      <p class="text-sm text-surface-600-400">{description}</p>
    </div>
    <nav aria-label="Chart mode" class="flex gap-1">
      {#each chartModes as m (m.id)}
        <a
          href={resolve(
            m.id === "monthly"
              ? "/energy/[id]"
              : m.id === "yoy"
                ? "/energy/[id]?view=yoy"
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

  {#if hasData}
    <svg
      viewBox="0 0 {W} {H + 20}"
      role="img"
      aria-label={ariaLabel}
      class="w-full"
    >
      {#if mode === "readings"}
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
            <title>{p.title}</title>
          </circle>
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
      {:else}
        {#each slots as slot, i (i)}
          {@const cx = PAD + i * step + step / 2}
          {#each slot.bars as bar, j (j)}
            {@const h = bar.value === null ? 0 : scale(bar.value)}
            <rect
              x={cx - (barWidth * per) / 2 + j * barWidth}
              y={H - h}
              width={barWidth}
              height={h}
              rx="2"
              class="fill-(--meter)"
              opacity={bar.previous ? 0.35 : bar.partial ? 0.6 : 1}
            >
              <title>{bar.title}</title>
            </rect>
          {/each}
          {#if i % every === 0}
            <text
              x={cx}
              y={H + 14}
              text-anchor="middle"
              class="fill-slate-500 text-[11px]"
            >
              {slot.label}
            </text>
          {/if}
        {/each}
      {/if}
    </svg>
    {#if mode === "yoy"}
      <p class="flex gap-4 text-xs text-surface-600-400">
        <span class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm bg-(--meter) opacity-35"></span>
          Year before
        </span>
        <span class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm bg-(--meter)"></span>
          Last 12 months
        </span>
      </p>
    {/if}
    <dl class="grid grid-cols-3 gap-3 text-xs">
      {#each figures as [label, value] (label)}
        <div>
          <dt class="font-bold tracking-wider uppercase opacity-60">
            {label}
          </dt>
          <dd class="text-sm font-bold">
            {value === null ? "—" : formatReading(value, unit)}
          </dd>
        </div>
      {/each}
    </dl>
  {:else}
    <p class="text-sm opacity-70">{emptyText}</p>
  {/if}
</section>

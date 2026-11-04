<script lang="ts">
  import { areaPath, chartPoints, linePath } from "#lib/account-detail.ts";
  import { formatMoney } from "#lib/format.ts";

  let {
    trajectory,
  }: { trajectory: { monthStart: string; balance: number }[] } = $props();

  const W = 480;
  const H = 180;
  const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const series = $derived(
    trajectory.map((p) => ({
      label: monthFmt.format(new Date(p.monthStart)),
      balance: p.balance,
    })),
  );
  const points = $derived(chartPoints(series, W, H));
  const balances = $derived(series.map((s) => s.balance));
  const min = $derived(Math.min(...balances));
  const peak = $derived(Math.max(...balances));
  const minPoint = $derived(points[balances.indexOf(min)]);
  const peakPoint = $derived(points[balances.indexOf(peak)]);
  const last = $derived(points[points.length - 1]);
  const first = $derived(series[0]);
  const lastSeries = $derived(series[series.length - 1]);
  const ariaLabel = $derived(
    series.length
      ? `Closing balance by month, ${first.label} to ${lastSeries.label}: ` +
          series.map((s) => `${s.label} ${formatMoney(s.balance)}`).join(", ")
      : "No balance history",
  );
</script>

<section
  aria-labelledby="trajectory-heading"
  class="flex flex-col justify-between gap-4 card border border-surface-200-800 p-6"
>
  <header>
    <h2 id="trajectory-heading" class="text-lg font-bold">
      Liquidity trajectory
    </h2>
    <p class="text-sm text-surface-600-400">
      Monthly closing balances, last {series.length} months
    </p>
  </header>

  {#if series.length}
    <svg
      viewBox="0 0 {W} {H + 20}"
      role="img"
      aria-label={ariaLabel}
      class="w-full text-emerald-700"
    >
      <defs>
        <linearGradient id="trajectory-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="currentColor" stop-opacity="0.15" />
          <stop offset="1" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath(points, H - 24)} fill="url(#trajectory-fill)" />
      <path
        d={linePath(points)}
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      {#each points as p (p.label)}
        <circle
          cx={p.x}
          cy={p.y}
          r="4"
          fill="currentColor"
          class="stroke-white dark:stroke-slate-900"
          stroke-width="2"
        />
        <text
          x={p.x}
          y={H + 8}
          text-anchor="middle"
          class="fill-slate-500 text-[11px]"
        >
          {p.label}
        </text>
      {/each}
      {#if peakPoint && peak !== min}
        <text
          x={peakPoint.x}
          y={peakPoint.y - 12}
          text-anchor="middle"
          class="fill-slate-700 text-[11px] font-bold dark:fill-slate-200"
        >
          {formatMoney(peak)}
        </text>
      {/if}
      {#if minPoint && last && minPoint !== last && peak !== min}
        <text
          x={minPoint.x}
          y={minPoint.y + 20}
          text-anchor="middle"
          class="fill-slate-500 text-[11px]"
        >
          {formatMoney(min)}
        </text>
      {/if}
    </svg>

    <dl class="grid grid-cols-3 gap-3 text-xs">
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">Min</dt>
        <dd class="text-sm font-bold">{formatMoney(min)}</dd>
      </div>
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">Now</dt>
        <dd class="text-sm font-bold">
          {formatMoney(lastSeries.balance)}
        </dd>
      </div>
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">Peak</dt>
        <dd class="text-sm font-bold">{formatMoney(peak)}</dd>
      </div>
    </dl>
  {/if}
</section>

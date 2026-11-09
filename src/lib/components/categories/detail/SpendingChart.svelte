<script lang="ts">
  import { resolve } from "$app/paths";
  import { SegmentedControl } from "@skeletonlabs/skeleton-svelte";
  import {
    chartRanges,
    type ChartRange,
    type DetailView,
  } from "#lib/category-detail.ts";
  import { formatMoney } from "#lib/format.ts";

  type Series = { monthStart: string; spent: number }[];
  type Mode = "out" | "in" | "transfer";

  let {
    series: spendingSeries,
    incomeSeries,
    transferSeries,
    range,
    route,
    id,
    queryFor,
    color,
  }: {
    series: Series;
    incomeSeries: Series;
    transferSeries: Series;
    range: ChartRange;
    /** The detail page these links point back to. */
    route: "/categories/[id]" | "/tags/[id]";
    id: number;
    /** Query string of this view with some fields replaced. */
    queryFor: (changes: Partial<DetailView>) => string;
    color: string | null;
  } = $props();

  const modes: { id: Mode; label: string }[] = [
    { id: "out", label: "Spending" },
    { id: "in", label: "Income" },
    { id: "transfer", label: "Transferred" },
  ];
  const copy: Record<Mode, { title: string; noun: string; empty: string }> = {
    out: {
      title: "Spending history",
      noun: "spending",
      empty: "No spending recorded yet.",
    },
    in: {
      title: "Income history",
      noun: "income",
      empty: "No income recorded yet.",
    },
    transfer: {
      title: "Transfer history",
      noun: "transfers",
      empty: "No transfers recorded yet.",
    },
  };

  let mode = $state<Mode>("out");
  const seriesByMode = $derived({
    out: spendingSeries,
    in: incomeSeries,
    transfer: transferSeries,
  });
  const series = $derived(seriesByMode[mode]);
  const text = $derived(copy[mode]);

  const W = 480;
  const H = 180;
  const PAD = 8;
  const fmt = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  const fmtYear = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });

  const peak = $derived(Math.max(0, ...series.map((s) => s.spent)));
  const step = $derived((W - PAD * 2) / Math.max(series.length, 1));
  const barWidth = $derived(Math.max(1, Math.min(32, step * 0.7)));
  const bars = $derived(
    series.map((s, i) => {
      const d = new Date(s.monthStart);
      const h = peak ? (s.spent / peak) * (H - 24) : 0;
      return {
        x: PAD + i * step + (step - barWidth) / 2,
        y: H - h,
        h,
        cx: PAD + i * step + step / 2,
        label: fmt.format(d),
        full: fmtYear.format(d),
        spent: s.spent,
      };
    }),
  );
  // Label at most ~8 months so a long history stays legible.
  const every = $derived(Math.max(1, Math.ceil(series.length / 8)));
  const total = $derived(series.reduce((sum, s) => sum + s.spent, 0));
  const ariaLabel = $derived(
    series.length
      ? `Monthly ${text.noun}, ${bars[0].full} to ${bars[bars.length - 1].full}: ` +
          bars.map((b) => `${b.full} ${formatMoney(b.spent)}`).join(", ")
      : `No ${text.noun} history`,
  );
</script>

<section
  aria-labelledby="chart-heading"
  class="flex flex-col justify-between gap-4 card border border-surface-200-800 p-6"
>
  <header class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 id="chart-heading" class="text-lg font-bold">{text.title}</h2>
      <p class="text-sm text-surface-600-400">
        Monthly {text.noun}, {series.length}
        {series.length === 1 ? "month" : "months"}
      </p>
    </div>
    <nav aria-label="Chart range" class="flex gap-1">
      {#each chartRanges as r (r.id)}
        <a
          href={resolve(`${route}?${queryFor({ range: r.id })}`, {
            id: String(id),
          })}
          data-sveltekit-reset="false"
          aria-current={r.id === range ? "true" : undefined}
          class="btn rounded-full text-xs btn-sm {r.id === range
            ? 'preset-filled-surface-950-50'
            : 'preset-tonal'}"
        >
          {r.label}
        </a>
      {/each}
    </nav>
  </header>

  {#if series.length}
    <svg
      viewBox="0 0 {W} {H + 20}"
      role="img"
      aria-label={ariaLabel}
      class="w-full text-emerald-700"
      style:color
    >
      {#each bars as b, i (b.full)}
        <rect
          x={b.x}
          y={b.y}
          width={barWidth}
          height={b.h}
          rx="2"
          fill="currentColor"
          opacity={b.spent === 0 ? 0.25 : 1}
        >
          <title>{b.full}: {formatMoney(b.spent)}</title>
        </rect>
        {#if i % every === 0}
          <text
            x={b.cx}
            y={H + 14}
            text-anchor="middle"
            class="fill-slate-500 text-[11px]"
          >
            {b.label}
          </text>
        {/if}
      {/each}
    </svg>

    <dl class="grid grid-cols-3 gap-3 text-xs">
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">Total</dt>
        <dd class="text-sm font-bold">{formatMoney(total)}</dd>
      </div>
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">
          Highest month
        </dt>
        <dd class="text-sm font-bold">{formatMoney(peak)}</dd>
      </div>
      <div>
        <dt class="font-bold tracking-wider uppercase opacity-60">Latest</dt>
        <dd class="text-sm font-bold">
          {formatMoney(series[series.length - 1].spent)}
        </dd>
      </div>
    </dl>
  {:else}
    <p class="text-sm opacity-70">{text.empty}</p>
  {/if}

  <SegmentedControl
    value={mode}
    onValueChange={(e) => (mode = e.value as Mode)}
    class="w-full"
  >
    <SegmentedControl.Control class="w-full">
      <SegmentedControl.Indicator />
      {#each modes as m (m.id)}
        <SegmentedControl.Item value={m.id} class="flex-1 justify-center">
          <SegmentedControl.ItemText>{m.label}</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      {/each}
    </SegmentedControl.Control>
  </SegmentedControl>
</section>

<script lang="ts">
  import { formatMoney, formatNumber } from "#lib/format.ts";
  import { yearSummary, type YearFill } from "#lib/vehicle-fuel.ts";

  let { entries, currency }: { entries: YearFill[]; currency: string } =
    $props();

  const summary = $derived(yearSummary(entries));
  const perKm = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
</script>

<section
  aria-labelledby="fuel-summary-heading"
  class="flex flex-col justify-between gap-6 card border border-surface-200-800 p-6"
>
  <div class="flex flex-col gap-2">
    <h2
      id="fuel-summary-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      Spent on fuel in {summary.year}
    </h2>
    <p class="text-4xl font-extrabold tracking-tight">
      {formatMoney(summary.spent, currency)}
    </p>
    <p class="text-sm text-surface-600-400">
      So far this year · {summary.fillUps}
      {summary.fillUps === 1 ? "fill-up" : "fill-ups"}
    </p>
  </div>

  <dl
    class="grid grid-cols-2 gap-3 border-t border-surface-200-800 pt-4 text-sm"
  >
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Monthly average
      </dt>
      <dd class="font-bold">
        {formatMoney(summary.monthlyAverage, currency)}
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Average price per km
      </dt>
      <dd class="font-bold">
        {summary.costPerKm === null
          ? "—"
          : `${perKm.format(summary.costPerKm)} ${currency} / km`}
        <span class="block text-xs font-medium opacity-60">
          {summary.distance > 0
            ? `Over ${formatNumber(summary.distance, "km")} driven`
            : "Needs two fill-ups"}
        </span>
      </dd>
    </div>
  </dl>
</section>

<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { intlLocale } from "#lib/i18n.ts";
  import { formatMoney, formatNumber } from "#lib/format.ts";
  import { yearSummary, type YearFill } from "#lib/vehicle-fuel.ts";

  let { entries, currency }: { entries: YearFill[]; currency: string } =
    $props();

  const summary = $derived(yearSummary(entries));
  const perKm = $derived(
    new Intl.NumberFormat(intlLocale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
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
      {m.vehicles_summary_heading({ year: summary.year })}
    </h2>
    <p class="text-4xl font-extrabold tracking-tight">
      {formatMoney(summary.spent, currency)}
    </p>
    <p class="text-sm text-surface-600-400">
      {m.vehicles_summary_so_far({ count: summary.fillUps })}
    </p>
  </div>

  <dl
    class="grid grid-cols-2 gap-3 border-t border-surface-200-800 pt-4 text-sm"
  >
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.vehicles_summary_monthly_average()}
      </dt>
      <dd class="font-bold">
        {formatMoney(summary.monthlyAverage, currency)}
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        {m.vehicles_summary_price_per_km()}
      </dt>
      <dd class="font-bold">
        {summary.costPerKm === null
          ? "—"
          : m.vehicles_summary_cost_per_km({
              price: perKm.format(summary.costPerKm),
              currency,
            })}
        <span class="block text-xs font-medium opacity-60">
          {summary.distance > 0
            ? m.vehicles_summary_distance({
                distance: formatNumber(summary.distance, "km"),
              })
            : m.vehicles_summary_needs_two()}
        </span>
      </dd>
    </div>
  </dl>
</section>

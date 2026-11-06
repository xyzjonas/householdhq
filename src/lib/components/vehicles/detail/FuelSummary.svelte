<script lang="ts">
  import { formatMoney, formatNumber } from "#lib/format.ts";
  import { averageUnitPrice, odometerGrowth } from "#lib/vehicle-fuel.ts";
  import type { FuelEntry } from "#lib/server/core/types.ts";

  let { entries, currency }: { entries: FuelEntry[]; currency: string } =
    $props();

  const spent = $derived(
    entries.reduce((sum, e) => sum + e.transaction.amount, 0),
  );
  const litres = $derived(entries.reduce((sum, e) => sum + e.fuelAmount, 0));
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
      Total spent on fuel
    </h2>
    <p class="text-4xl font-extrabold tracking-tight">
      {formatMoney(spent, currency)}
    </p>
    <p class="text-sm text-surface-600-400">
      {entries.length}
      {entries.length === 1 ? "fill-up" : "fill-ups"} recorded
    </p>
  </div>

  <dl
    class="grid grid-cols-2 gap-3 border-t border-surface-200-800 pt-4 text-sm"
  >
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Distance
      </dt>
      <dd class="font-bold">{formatNumber(odometerGrowth(entries), "km")}</dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Fuel
      </dt>
      <dd class="font-bold">{formatNumber(litres, "L")}</dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Average price
      </dt>
      <dd class="font-bold">
        {formatNumber(averageUnitPrice(entries))}
        {currency} / L
      </dd>
    </div>
  </dl>
</section>

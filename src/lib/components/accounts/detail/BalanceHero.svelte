<script lang="ts">
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import { formatMoney } from "#lib/format.ts";

  let {
    balance,
    delta,
    disponible,
    projectedMonthEnd,
  }: {
    balance: number;
    delta: number | null;
    disponible: boolean;
    projectedMonthEnd: number;
  } = $props();

  const up = $derived((delta ?? 0) >= 0);
  const Trend = $derived(up ? TrendingUp : TrendingDown);
</script>

<section
  aria-labelledby="balance-heading"
  class="flex flex-col justify-between gap-6 card border border-surface-200-800 p-6"
>
  <div class="flex flex-col gap-2">
    <h2
      id="balance-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      Active current balance
    </h2>
    <p class="text-4xl font-extrabold tracking-tight">
      {formatMoney(balance)}
    </p>
    {#if delta !== null}
      <p>
        <span
          class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold {up
            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
            : 'border-red-100 bg-red-50 text-red-700'}"
        >
          <Trend size={14} aria-hidden="true" />
          {up ? "+" : ""}{formatMoney(delta)} vs last month
        </span>
      </p>
    {/if}
  </div>

  <dl
    class="grid grid-cols-2 gap-3 border-t border-surface-200-800 pt-4 text-sm"
  >
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Disponible
      </dt>
      <dd class="font-bold">
        {disponible ? formatMoney(balance) : formatMoney(0)}
        <span
          class="block text-xs font-medium {disponible
            ? 'text-emerald-700'
            : 'opacity-60'}"
        >
          {disponible ? "100% liquid" : "Not marked as disponible"}
        </span>
      </dd>
    </div>
    <div class="flex flex-col gap-1">
      <dt class="text-xs font-bold tracking-wider uppercase opacity-60">
        Projected month end
      </dt>
      <dd class="font-bold">
        {formatMoney(projectedMonthEnd)}
        <span class="block text-xs font-medium opacity-60">
          Includes scheduled entries
        </span>
      </dd>
    </div>
  </dl>
</section>

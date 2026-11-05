<script lang="ts">
  import { formatMoney } from "#lib/format.ts";
  import type { BurnSlice } from "#lib/categories-view.ts";

  let { slices }: { slices: BurnSlice[] } = $props();

  /** Hard-stop conic gradient, one segment per slice. */
  const gradient = $derived.by(() => {
    let at = 0;
    const stops = slices.map((s) => {
      const start = at;
      at += s.share;
      return `${s.color} ${start}% ${at}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  });
</script>

<section
  aria-labelledby="burn-heading"
  class="flex flex-col gap-4 card border border-surface-200-800 p-5"
>
  <h2
    id="burn-heading"
    class="text-xs font-bold tracking-wider uppercase opacity-60"
  >
    Burn concentration
  </h2>
  {#if slices.length}
    <div
      role="img"
      aria-label="Share of spending: {slices
        .map((s) => `${s.label} ${s.share.toFixed(1)}%`)
        .join(', ')}"
      class="donut mx-auto size-36 rounded-full"
      style="background: {gradient}"
    >
      <p class="grid size-full place-items-center text-center">
        <span class="text-xl font-extrabold">{slices[0].share.toFixed(1)}%</span
        >
        <span class="-mt-5 max-w-20 truncate text-[11px] opacity-60">
          {slices[0].label}
        </span>
      </p>
    </div>
    <ul class="flex flex-col gap-2 text-sm">
      {#each slices as s (s.label)}
        <li class="flex items-center justify-between gap-2">
          <span class="flex min-w-0 items-center gap-2">
            <span
              class="size-2.5 shrink-0 rounded-full"
              style="background-color: {s.color}"
              aria-hidden="true"
            ></span>
            <span class="truncate">{s.label}</span>
          </span>
          <span class="font-semibold tabular-nums">{formatMoney(s.amount)}</span
          >
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-sm opacity-70">No spending recorded this month.</p>
  {/if}
</section>

<style scoped>
  .donut {
    mask: radial-gradient(circle, transparent 54%, #000 55%);
  }
</style>

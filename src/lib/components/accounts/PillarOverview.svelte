<script lang="ts">
  import { formatMoney } from "#lib/format.ts";
  import type { Pillar } from "#lib/accounts-view.ts";

  let { pillars }: { pillars: Pillar[] } = $props();
</script>

<div class="flex flex-col gap-5">
  <div
    role="img"
    aria-label="Wealth allocation by pillar"
    class="flex h-3 w-full overflow-hidden rounded-full bg-surface-200-800 shadow-inner"
  >
    {#each pillars as p (p.type)}
      <span
        class="h-full transition-all duration-500 {p.color}"
        style:width="{p.share}%"
        title="{p.title}: {p.share.toFixed(1)}%"
      ></span>
    {/each}
  </div>

  <ul
    class="no-scrollbar -mx-4 flex touch-pan-x snap-x snap-mandatory scroll-px-4 flex-nowrap gap-3.5 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
  >
    {#each pillars as p (p.type)}
      <li
        class="flex w-[240px] shrink-0 snap-start flex-col gap-1 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-4 transition-all duration-150 hover:border-surface-400-600 hover:bg-surface-50-950 sm:w-[260px] lg:w-auto"
      >
        <div class="mb-2 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full {p.color}" aria-hidden="true"
            ></span>
            <h3 class="text-sm font-bold tracking-tight">{p.title}</h3>
          </div>
          <span
            class="rounded-full border px-2 py-0.5 text-xs font-bold tabular-nums {p.badge}"
          >
            {p.share.toFixed(1)}%
          </span>
        </div>
        <p class="text-xl font-extrabold tracking-tight tabular-nums">
          {formatMoney(p.balance)}
        </p>
        <p class="truncate text-xs font-medium text-surface-600-400">
          {p.scope}
        </p>
      </li>
    {/each}
  </ul>
</div>

<style scoped>
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>

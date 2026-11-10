<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { formatMoney } from "#lib/format.ts";
  import type { Pillar } from "#lib/accounts-view.ts";

  let { pillars }: { pillars: Pillar[] } = $props();
</script>

<section
  aria-labelledby="pillars-heading"
  class="flex flex-col gap-5 card border border-surface-200-800 p-6"
>
  <h2 id="pillars-heading" class="text-lg font-bold">
    {m.accounts_pillars_heading()}
  </h2>

  <div
    role="img"
    aria-label={m.accounts_pillars_chart_label()}
    class="flex h-3 w-full overflow-hidden rounded-full bg-surface-200-800"
  >
    {#each pillars as p (p.type)}
      {#if p.share !== null}
        <span class={p.color} style:width="{p.share}%"></span>
      {/if}
    {/each}
  </div>

  <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
    {#each pillars as p (p.type)}
      <li
        class="flex flex-col gap-1 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-4"
      >
        <div class="flex items-center gap-2">
          <span class="size-2.5 rounded-full {p.color}" aria-hidden="true"
          ></span>
          <h3 class="text-sm font-bold">{p.title}</h3>
        </div>
        <p class="text-xs text-surface-600-400">{p.subtitle}</p>
        <p class="mt-2 text-lg font-bold">{formatMoney(p.balance)}</p>
        {#if p.share !== null}
          <p>
            <span class="badge preset-tonal text-[11px] font-bold">
              {p.share.toFixed(1)}%
            </span>
          </p>
        {/if}
      </li>
    {/each}
  </ul>
</section>

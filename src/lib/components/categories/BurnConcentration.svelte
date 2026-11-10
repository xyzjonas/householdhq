<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { formatMoney } from "#lib/format.ts";
  import { intlLocale } from "#lib/i18n.ts";
  import type { BurnSlice } from "#lib/categories-view.ts";

  let { slices }: { slices: BurnSlice[] } = $props();

  /** "12.3%" in the active language. */
  const percent = (share: number) =>
    new Intl.NumberFormat(intlLocale(), {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(share / 100);

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
    {m.categories_burn_heading()}
  </h2>
  {#if slices.length}
    <div
      role="img"
      aria-label={m.categories_burn_aria({
        list: slices.map((s) => `${s.label} ${percent(s.share)}`).join(", "),
      })}
      class="donut mx-auto size-36 rounded-full"
      style="background: {gradient}"
    >
      <p class="grid size-full place-items-center text-center">
        <span class="text-xl font-extrabold">{percent(slices[0].share)}</span>
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
    <p class="text-sm opacity-70">{m.categories_burn_empty()}</p>
  {/if}
</section>

<style scoped>
  .donut {
    mask: radial-gradient(circle, transparent 54%, #000 55%);
  }
</style>

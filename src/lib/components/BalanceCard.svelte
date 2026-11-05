<script lang="ts">
  import { formatMoney } from "#lib/format.ts";

  let {
    label,
    amount,
    hint,
    featured = false,
  }: {
    label: string;
    amount: number;
    hint?: string;
    featured?: boolean;
  } = $props();
</script>

<article
  class="flex w-[calc(100%-1.5rem)] shrink-0 snap-start flex-col gap-1 card p-5 sm:w-auto sm:shrink {featured
    ? 'preset-filled-surface-950-50'
    : 'border border-surface-200-800 preset-filled-surface-50-950'}"
>
  <h2 class="text-xs font-semibold tracking-wider uppercase opacity-70">
    {label}
  </h2>
  <p class="text-3xl font-extrabold tracking-tight">{formatMoney(amount)}</p>
  {#if hint}<p class="text-sm opacity-70">{hint}</p>{/if}
</article>

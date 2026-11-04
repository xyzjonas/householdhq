<script lang="ts">
  import { formatMoney } from "#lib/format.ts";

  export interface Segment {
    label: string;
    amount: number;
    /** Tailwind background class */
    color: string;
  }

  let { segments }: { segments: Segment[] } = $props();

  const total = $derived(segments.reduce((sum, s) => sum + s.amount, 0));
  const share = (s: Segment) => (total > 0 ? (s.amount / total) * 100 : 0);
</script>

<figure class="flex flex-col gap-3">
  <div
    role="img"
    aria-label="Portfolio allocation"
    class="flex h-2.5 overflow-hidden rounded-full bg-surface-200-800"
  >
    {#each segments as s (s.label)}
      <span class={s.color} style:width="{share(s)}%"></span>
    {/each}
  </div>
  <figcaption>
    <ul class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {#each segments as s (s.label)}
        <li class="flex items-center gap-2">
          <span class="size-2.5 rounded-full {s.color}" aria-hidden="true"
          ></span>
          <span>{s.label}</span>
          <span class="opacity-60">
            {share(s).toFixed(1)}% · {formatMoney(s.amount)}
          </span>
        </li>
      {/each}
    </ul>
  </figcaption>
</figure>

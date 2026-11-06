<script lang="ts" generics="T extends { id: number }">
  import type { Snippet } from "svelte";
  import { fallbackVehicleColor } from "#lib/vehicle-icons.ts";

  let {
    items,
    color = null,
    item,
  }: {
    items: T[];
    color?: string | null;
    item: Snippet<[T]>;
  } = $props();
</script>

<ol
  class="flex flex-col gap-3"
  style="--vehicle: {color ?? fallbackVehicleColor}"
>
  {#each items as entry (entry.id)}
    <li class="relative pl-6">
      <span
        class="dot absolute top-5 left-0 size-3 rounded-full"
        aria-hidden="true"
      ></span>
      {@render item(entry)}
    </li>
  {/each}
</ol>

<style scoped>
  /* The rail runs through all dots; the dot sits on top of it. */
  ol {
    position: relative;
  }

  ol::before {
    content: "";
    position: absolute;
    top: 1.5rem;
    bottom: 1.5rem;
    left: 0.3125rem;
    width: 2px;
    background-color: color-mix(in srgb, var(--vehicle) 35%, transparent);
  }

  .dot {
    background-color: var(--vehicle);
    box-shadow: 0 0 0 3px var(--color-surface-50-950, transparent);
  }
</style>

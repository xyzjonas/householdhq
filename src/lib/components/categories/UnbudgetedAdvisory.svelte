<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import type { CategoryItem } from "#lib/categories-view.ts";

  let { items }: { items: CategoryItem[] } = $props();

  const preview = $derived(items.slice(0, 5).map((i) => i.name));
</script>

{#if items.length}
  <section
    aria-labelledby="unbudgeted-heading"
    class="flex flex-col gap-2 card border border-surface-200-800 p-5"
  >
    <h2
      id="unbudgeted-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      {m.categories_unbudgeted_heading()}
    </h2>
    <p class="text-sm font-bold">
      {m.categories_unbudgeted_summary({ count: items.length })}
    </p>
    <p class="text-xs wrap-break-word text-slate-500">
      {preview.join(", ")}{items.length > preview.length ? ", …" : ""}
    </p>
  </section>
{/if}

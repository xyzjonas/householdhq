<script lang="ts">
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
      Unbudgeted
    </h2>
    <p class="text-sm font-bold">
      {items.length}
      {items.length === 1 ? "category has" : "categories have"} no budget
    </p>
    <p class="text-xs wrap-break-word text-slate-500">
      {preview.join(", ")}{items.length > preview.length ? ", …" : ""}
    </p>
  </section>
{/if}

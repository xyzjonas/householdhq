<script lang="ts">
  import { resolve } from "$app/paths";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { monthLabel } from "#lib/categories-view.ts";

  let {
    month,
    previous,
    next,
  }: { month: string; previous: string; next: string } = $props();
</script>

<nav aria-label="Fiscal month" class="flex items-center gap-1">
  <a
    href="{resolve('/categories')}?month={previous}"
    class="btn-icon preset-tonal"
    aria-label="Previous month: {monthLabel(previous)}"
  >
    <ChevronLeft size={16} aria-hidden="true" />
  </a>
  <span class="min-w-32 text-center text-sm font-bold" aria-current="date">
    {monthLabel(month)}
  </span>
  <a
    href="{resolve('/categories')}?month={next}"
    class="btn-icon preset-tonal"
    aria-label="Next month: {monthLabel(next)}"
  >
    <ChevronRight size={16} aria-hidden="true" />
  </a>
</nav>

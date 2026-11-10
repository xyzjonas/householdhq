<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { monthLabel } from "#lib/categories-view.ts";

  let {
    month,
    previous,
    next,
    route = "/categories",
  }: {
    month: string;
    previous: string;
    next: string;
    /** The directory page the switcher navigates. */
    route?: "/categories" | "/tags";
  } = $props();
</script>

<nav aria-label={m.categories_fiscal_month()} class="flex items-center gap-1">
  <a
    href={resolve(`${route}?month=${previous}`)}
    class="btn-icon preset-tonal"
    aria-label={m.categories_previous_month({
      month: monthLabel(previous),
    })}
  >
    <ChevronLeft size={16} aria-hidden="true" />
  </a>
  <span class="min-w-32 text-center text-sm font-bold" aria-current="date">
    {monthLabel(month)}
  </span>
  <a
    href={resolve(`${route}?month=${next}`)}
    class="btn-icon preset-tonal"
    aria-label={m.categories_next_month({ month: monthLabel(next) })}
  >
    <ChevronRight size={16} aria-hidden="true" />
  </a>
</nav>

<script lang="ts">
  import { resolve } from "$app/paths";
  import { formatMoney } from "#lib/format.ts";
  import type { TagItem } from "#lib/tags-view.ts";
  import CategoryGlyph from "../categories/CategoryGlyph.svelte";

  let { items }: { items: TagItem[] } = $props();
</script>

<ul class="flex flex-col gap-3 lg:hidden">
  {#each items as item (item.id)}
    <li>
      <article
        class="relative flex min-h-12 flex-col gap-3 card border border-surface-200-800 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <CategoryGlyph icon={item.icon} color={item.color} />
            <div class="min-w-0">
              <h3 class="truncate text-sm font-bold tracking-tight">
                <a
                  href={resolve("/tags/[id]", { id: String(item.id) })}
                  class="after:absolute after:inset-0 hover:underline"
                >
                  {item.name}
                </a>
              </h3>
              <p class="text-xs text-slate-500">
                {item.entries}
                {item.entries === 1 ? "entry" : "entries"}
              </p>
            </div>
          </div>
          <p
            class="shrink-0 text-right text-base font-bold tabular-nums {item.isInflow
              ? 'text-emerald-600'
              : 'text-surface-950-50'}"
          >
            {item.isInflow ? "+" : ""}{formatMoney(item.amount)}
          </p>
        </div>
        {#if item.subtitle}
          <p class="text-xs text-slate-400">{item.subtitle}</p>
        {/if}
      </article>
    </li>
  {:else}
    <li class="text-sm opacity-70">No tags found.</li>
  {/each}
</ul>

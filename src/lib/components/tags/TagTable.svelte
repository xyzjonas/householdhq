<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import { formatMoney } from "#lib/format.ts";
  import type { TagItem } from "#lib/tags-view.ts";
  import CategoryGlyph from "../categories/CategoryGlyph.svelte";

  let { items, monthLabel }: { items: TagItem[]; monthLabel: string } =
    $props();
</script>

<div class="hidden overflow-x-auto card border border-surface-200-800 lg:block">
  <table class="w-full text-left text-sm">
    <caption class="sr-only"
      >{m.tags_table_caption({ month: monthLabel })}</caption
    >
    <thead
      class="bg-surface-100-900 text-xs tracking-wider text-surface-600-400 uppercase"
    >
      <tr>
        <th scope="col" class="w-2/5 px-4 py-3 font-bold">
          {m.tags_table_col_tag()}
        </th>
        <th scope="col" class="px-4 py-3 text-right font-bold">
          {m.tags_table_col_activity()}
        </th>
        <th scope="col" class="px-4 py-3 text-right font-bold">
          {m.tags_table_col_entries()}
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-surface-200-800">
      {#each items as item (item.id)}
        <tr class="relative transition-colors hover:bg-surface-100-900">
          <th scope="row" class="px-4 py-3 font-normal">
            <span class="flex items-center gap-3">
              <CategoryGlyph icon={item.icon} color={item.color} />
              <span class="min-w-0">
                <span class="block truncate text-sm font-bold tracking-tight">
                  <a
                    href={resolve("/tags/[id]", { id: String(item.id) })}
                    class="after:absolute after:inset-0 hover:underline"
                  >
                    {item.name}
                  </a>
                </span>
                {#if item.subtitle}
                  <span class="block truncate text-xs text-slate-400">
                    {item.subtitle}
                  </span>
                {/if}
              </span>
            </span>
          </th>
          <td
            class="px-4 py-3 text-right font-bold tabular-nums {item.isInflow
              ? 'text-emerald-600'
              : 'text-surface-950-50'}"
          >
            {item.isInflow ? "+" : ""}{formatMoney(item.amount)}
          </td>
          <td class="px-4 py-3 text-right text-slate-500 tabular-nums">
            {item.entries}
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="3" class="px-4 py-8 text-center text-sm opacity-70">
            {m.tags_empty()}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

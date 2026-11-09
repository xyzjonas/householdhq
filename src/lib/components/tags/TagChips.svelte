<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Tag } from "#lib/server/core/types.ts";

  let { tags }: { tags: Pick<Tag, "id" | "name">[] } = $props();
</script>

{#if tags.length}
  <ul class="flex flex-wrap gap-1" aria-label="Tags">
    {#each tags as tag (tag.id)}
      <li>
        <a
          href={resolve("/tags/[id]", { id: String(tag.id) })}
          class="badge preset-tonal text-[11px] hover:preset-filled-surface-950-50"
        >
          {tag.name}
        </a>
      </li>
    {/each}
  </ul>
{/if}

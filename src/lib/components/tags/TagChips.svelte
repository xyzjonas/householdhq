<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import {
    chipClass,
    chipInteractiveClass,
    chipStyle,
  } from "#lib/components/chip.ts";
  import type { Tag } from "#lib/server/core/types.ts";

  let { tags }: { tags: Pick<Tag, "id" | "name" | "color">[] } = $props();
</script>

{#if tags.length}
  <ul class="flex flex-wrap gap-1" aria-label={m.tags_chips_label()}>
    {#each tags as tag (tag.id)}
      <li>
        <a
          href={resolve("/tags/[id]", { id: String(tag.id) })}
          class="{chipClass} {chipInteractiveClass}"
          style={chipStyle(tag.color)}
        >
          {tag.name}
        </a>
      </li>
    {/each}
  </ul>
{/if}

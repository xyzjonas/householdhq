<script lang="ts">
  import type { Snippet } from "svelte";
  import { chipClass, chipStyle } from "./chip";

  let {
    color = null,
    children,
  }: {
    /** Configured colour (hex) to tint the chip with. */
    color?: string | null;
    children: Snippet;
  } = $props();
</script>

<span class={chipClass} style={chipStyle(color)}>{@render children()}</span>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { chipClass } from "./chip";

  let { children }: { children: Snippet } = $props();
</script>

<span class={chipClass}>{@render children()}</span>

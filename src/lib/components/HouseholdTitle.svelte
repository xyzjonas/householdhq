<script lang="ts">
  import { resolve } from "$app/paths";
  import type { HouseholdSummary } from "#lib/household.ts";
  import { m } from "#paraglide/messages.js";
  import CategoryGlyph from "./categories/CategoryGlyph.svelte";
  import HouseholdSwitchDialog from "./HouseholdSwitchDialog.svelte";

  let {
    household,
    households,
  }: { household: HouseholdSummary; households: HouseholdSummary[] } = $props();
</script>

<!-- The household is the app's title; the product name is a quiet mark above. -->
<div class="flex min-w-0 items-center gap-3">
  <CategoryGlyph icon={household.icon} color={household.color} />
  <div class="flex min-w-0 flex-1 flex-col">
    <span
      class="truncate text-[0.625rem] leading-none font-bold tracking-widest text-surface-500 uppercase"
    >
      {m.common_app_name()}
    </span>
    <a
      href={resolve("/")}
      class="truncate text-lg leading-tight font-extrabold tracking-tight"
      title={household.name}
    >
      {household.name}
    </a>
  </div>
  {#if households.length > 1}
    <HouseholdSwitchDialog {household} {households} />
  {/if}
</div>

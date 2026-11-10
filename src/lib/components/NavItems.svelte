<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Navigation } from "@skeletonlabs/skeleton-svelte";
  import {
    isActive,
    navItems,
    primaryNavItems,
    visibleNavItems,
  } from "#lib/nav.ts";
  import MoreNavSheet from "./MoreNavSheet.svelte";

  let { layout }: { layout: "sidebar" | "bar" } = $props();

  // The bar only has room for the primary items; the rest live under "More".
  const items = $derived(
    visibleNavItems(
      layout === "bar" ? primaryNavItems : navItems,
      page.data.user,
    ),
  );

  const iconSize = $derived(layout === "sidebar" ? 18 : 22);
  const rootClass = $derived(
    layout === "sidebar" ? "w-full bg-transparent p-0" : "bg-transparent",
  );
  const triggerClass = $derived(layout === "bar" ? "min-w-0 flex-1 px-0" : "");
</script>

<Navigation {layout} class={rootClass}>
  <Navigation.Content>
    <Navigation.Menu class={layout === "bar" ? "gap-0" : ""}>
      {#each items as item (item.label)}
        {@const Icon = item.icon}
        {#if item.href}
          {@const active = isActive(item.href, page.url.pathname)}
          <Navigation.TriggerAnchor
            href={resolve(item.href)}
            aria-current={active ? "page" : undefined}
            class="{triggerClass} {active
              ? 'preset-filled-surface-950-50'
              : ''}"
          >
            <Icon size={iconSize} aria-hidden="true" />
            <Navigation.TriggerText>{item.label}</Navigation.TriggerText>
          </Navigation.TriggerAnchor>
        {:else}
          <!-- Not built yet: shown, but not interactive -->
          <Navigation.Trigger
            disabled
            class="{triggerClass} cursor-not-allowed opacity-50"
          >
            <Icon size={iconSize} aria-hidden="true" />
            <Navigation.TriggerText>{item.label}</Navigation.TriggerText>
          </Navigation.Trigger>
        {/if}
      {/each}
      {#if layout === "bar"}
        <MoreNavSheet {triggerClass} />
      {/if}
    </Navigation.Menu>
  </Navigation.Content>
</Navigation>

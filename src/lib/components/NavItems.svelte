<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Navigation } from "@skeletonlabs/skeleton-svelte";
  import { navItems } from "#lib/nav.ts";

  let { layout }: { layout: "sidebar" | "bar" } = $props();

  const iconSize = $derived(layout === "sidebar" ? 18 : 22);
  const rootClass = $derived(
    layout === "sidebar" ? "w-full bg-transparent p-0" : "bg-transparent",
  );
  const triggerClass = $derived(
    layout === "bar" ? "min-w-0 flex-1 px-0" : "rounded-full",
  );
</script>

<Navigation {layout} class={rootClass}>
  <Navigation.Content>
    <Navigation.Menu class={layout === "bar" ? "gap-0" : ""}>
      {#each navItems as item (item.label)}
        {@const Icon = item.icon}
        {#if item.href}
          {@const active = page.url.pathname === item.href}
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
    </Navigation.Menu>
  </Navigation.Content>
</Navigation>

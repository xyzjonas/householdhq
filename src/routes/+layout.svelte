<script lang="ts">
  import "./layout.css";
  import favicon from "#lib/assets/favicon.svg";
  import AppShell from "#lib/components/AppShell.svelte";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Household HQ</title>
</svelte:head>

<AppShell>{@render children()}</AppShell>

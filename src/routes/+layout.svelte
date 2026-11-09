<script lang="ts">
  import "./layout.css";
  import Toaster from "#lib/components/Toaster.svelte";
  import UpdateBanner from "#lib/components/UpdateBanner.svelte";
  import AppShell from "#lib/components/AppShell.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#4f46e5" />
  <title>Household HQ</title>
</svelte:head>

{#if data.user}
  <AppShell user={data.user}>{@render children()}</AppShell>
{:else}
  {@render children()}
{/if}

<UpdateBanner />
<Toaster />

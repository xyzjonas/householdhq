<script lang="ts">
  import "./layout.css";
  import Toaster from "#lib/components/Toaster.svelte";
  import UpdateBanner from "#lib/components/UpdateBanner.svelte";
  import NavigationProgress from "#lib/components/NavigationProgress.svelte";
  import { watchSlowNavigation } from "#lib/navigation.svelte.ts";
  import AppShell from "#lib/components/AppShell.svelte";
  import SoloShell from "#lib/components/SoloShell.svelte";
  import { m } from "#paraglide/messages.js";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();

  watchSlowNavigation();
</script>

<svelte:head>
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#4f46e5" />
  <title>{m.common_app_name()}</title>
</svelte:head>

{#if data.user && data.household}
  <AppShell
    user={data.user}
    household={data.household}
    households={data.households}
  >
    {@render children()}
  </AppShell>
{:else if data.user}
  <!-- Not in any household (yet): nothing to navigate, only the account. -->
  <SoloShell user={data.user}>{@render children()}</SoloShell>
{:else}
  {@render children()}
{/if}

<NavigationProgress />
<UpdateBanner />
<Toaster />

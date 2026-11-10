<script lang="ts">
  import { onMount } from "svelte";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { m } from "#paraglide/messages.js";
  import { pwaUpdate, watchForUpdates } from "#lib/pwa-update.svelte.ts";

  onMount(watchForUpdates);
</script>

{#if pwaUpdate.ready}
  <aside
    role="status"
    class="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 card preset-filled-primary-500 p-4 shadow-lg lg:bottom-4"
  >
    <p class="flex-1 text-sm font-medium">{m.layout_update_available()}</p>
    <button
      type="button"
      class="btn preset-filled-surface-50-950 btn-sm"
      onclick={() => pwaUpdate.apply()}
    >
      <RefreshCw size={16} aria-hidden="true" />
      <span>{m.layout_update()}</span>
    </button>
  </aside>
{/if}

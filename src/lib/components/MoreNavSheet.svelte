<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import { Dialog, Navigation, Portal } from "@skeletonlabs/skeleton-svelte";
  import { isActive, moreNavItems, visibleNavItems } from "#lib/nav.ts";
  import { m } from "#paraglide/messages.js";

  let { triggerClass = "" }: { triggerClass?: string } = $props();

  let open = $state(false);

  const items = $derived(visibleNavItems(moreNavItems, page.data.user));

  // The trigger stands in for any hidden item that is currently open.
  const active = $derived(
    items.some((item) => item.href && isActive(item.href, page.url.pathname)),
  );
</script>

<Navigation.Trigger
  type="button"
  aria-haspopup="dialog"
  aria-expanded={open}
  aria-current={active ? "page" : undefined}
  class="{triggerClass} {active ? 'preset-filled-surface-950-50' : ''}"
  onclick={() => (open = true)}
>
  <Ellipsis size={22} aria-hidden="true" />
  <Navigation.TriggerText>{m.nav_more()}</Navigation.TriggerText>
</Navigation.Trigger>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex items-end">
      <Dialog.Content
        class="flex w-full flex-col gap-2 rounded-t-container bg-surface-50-950 p-4 pb-8 shadow-xl"
      >
        <Dialog.Title class="px-2 text-sm font-bold opacity-70">
          {m.nav_more()}
        </Dialog.Title>
        <nav aria-label={m.nav_more()}>
          <ul class="flex flex-col gap-1">
            {#each items as item (item.key)}
              {@const Icon = item.icon}
              <li>
                {#if item.href}
                  {@const current = isActive(item.href, page.url.pathname)}
                  <a
                    href={resolve(item.href)}
                    aria-current={current ? "page" : undefined}
                    class="btn w-full justify-start {current
                      ? 'preset-filled-surface-950-50'
                      : 'preset-tonal'}"
                    onclick={() => (open = false)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label()}</span>
                  </a>
                {:else}
                  <!-- Not built yet: shown, but not interactive -->
                  <button
                    type="button"
                    disabled
                    class="btn w-full cursor-not-allowed justify-start preset-tonal opacity-50"
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label()}</span>
                  </button>
                {/if}
              </li>
            {/each}
          </ul>
        </nav>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

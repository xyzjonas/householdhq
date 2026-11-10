<script lang="ts">
  import { resolve } from "$app/paths";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Check from "@lucide/svelte/icons/check";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import X from "@lucide/svelte/icons/x";
  import type { HouseholdSummary } from "#lib/household.ts";
  import CategoryGlyph from "./categories/CategoryGlyph.svelte";

  let {
    household,
    households,
  }: { household: HouseholdSummary; households: HouseholdSummary[] } = $props();

  let open = $state(false);
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Trigger
    class="btn-icon shrink-0 preset-tonal btn-icon-sm"
    aria-label="Switch household"
  >
    <ChevronsUpDown size={16} aria-hidden="true" />
  </Dialog.Trigger>
  <Portal>
    {#if open}
      <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
      <Dialog.Positioner
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <Dialog.Content
          class="flex max-h-[85vh] w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
        >
          <header class="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title class="text-lg font-bold"
                >Switch household</Dialog.Title
              >
              <Dialog.Description class="text-sm text-surface-600-400">
                Everything you see belongs to one household at a time.
              </Dialog.Description>
            </div>
            <Dialog.CloseTrigger
              class="btn-icon preset-tonal btn-icon-sm"
              aria-label="Close"
            >
              <X size={16} aria-hidden="true" />
            </Dialog.CloseTrigger>
          </header>
          <!-- Plain POSTs on purpose: a full reload drops everything the previous
             household's pages had in memory. -->
          <ul class="flex flex-col gap-2 overflow-y-auto">
            {#each households as option (option.id)}
              {@const current = option.id === household.id}
              <li>
                <form method="POST" action={resolve("/household/switch")}>
                  <input type="hidden" name="householdId" value={option.id} />
                  <button
                    type="submit"
                    aria-current={current ? "true" : undefined}
                    class="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors {current
                      ? 'border-surface-950-50'
                      : 'border-surface-200-800 hover:border-surface-400-600'}"
                  >
                    <CategoryGlyph icon={option.icon} color={option.color} />
                    <span class="min-w-0 flex-1 truncate font-bold">
                      {option.name}
                    </span>
                    {#if current}
                      <Check size={16} aria-hidden="true" />
                      <span class="sr-only">Current household</span>
                    {/if}
                  </button>
                </form>
              </li>
            {/each}
          </ul>
        </Dialog.Content>
      </Dialog.Positioner>
    {/if}
  </Portal>
</Dialog>

<script lang="ts">
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Check from "@lucide/svelte/icons/check";
  import X from "@lucide/svelte/icons/x";
  import { accountTypeLabel, accountTypeOptions } from "#lib/account-types.ts";
  import type { SourceType } from "#lib/server/core/types.ts";

  let {
    value,
    onsave,
  }: {
    value: SourceType;
    onsave: (type: SourceType) => Promise<void>;
  } = $props();

  let open = $state(false);
  let saving = $state(false);

  async function choose(type: SourceType) {
    if (type === value) {
      open = false;
      return;
    }
    saving = true;
    try {
      await onsave(type);
      open = false;
    } catch {
      // The parent shows the error; keep the dialog open for another try.
    } finally {
      saving = false;
    }
  }
</script>

<div
  class="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
>
  <div class="min-w-0">
    <p class="text-xs font-bold tracking-wider uppercase opacity-60">
      Account type
    </p>
    <p class="truncate text-base font-bold">{accountTypeLabel(value)}</p>
    {#if value === "RETIREMENT"}
      <p class="text-xs text-surface-600-400">
        Retirement accounts are not included in the net worth calculation.
      </p>
    {/if}
  </div>
  <button
    type="button"
    class="btn shrink-0 rounded-full preset-tonal text-xs"
    onclick={() => (open = true)}
  >
    Change type
  </button>
</div>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <header class="flex items-start justify-between gap-4">
          <div>
            <Dialog.Title class="text-lg font-bold">
              Choose account type
            </Dialog.Title>
            <Dialog.Description class="text-sm text-surface-600-400">
              Decides where the account is grouped in the accounts overview.
            </Dialog.Description>
          </div>
          <Dialog.CloseTrigger
            class="btn-icon preset-tonal btn-icon-sm"
            aria-label="Close"
          >
            <X size={16} aria-hidden="true" />
          </Dialog.CloseTrigger>
        </header>

        <div
          role="radiogroup"
          aria-label="Account type"
          class="flex flex-col gap-2"
        >
          {#each accountTypeOptions as option (option.type)}
            {@const selected = option.type === value}
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={saving}
              class="flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors {selected
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                : 'border-surface-200-800 hover:border-surface-400-600'}"
              onclick={() => choose(option.type)}
            >
              <span class="flex min-w-0 flex-col">
                <span class="text-sm font-bold">{option.label}</span>
                <span class="text-xs opacity-70">{option.description}</span>
              </span>
              {#if selected}
                <Check size={18} class="shrink-0" aria-hidden="true" />
              {/if}
            </button>
          {/each}
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

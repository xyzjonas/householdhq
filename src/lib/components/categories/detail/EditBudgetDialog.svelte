<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Pencil from "@lucide/svelte/icons/pencil";

  let {
    name,
    budget,
    message = "",
  }: {
    /** The category or tag the budget belongs to. */
    name: string;
    budget?: number;
    /** Validation error from the last submission. */
    message?: string;
  } = $props();

  let open = $state(false);
  let submitting = $state(false);
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Trigger class="btn preset-tonal">
    <Pencil size={16} aria-hidden="true" />
    <span>
      {budget === undefined ? m.budget_set_action() : m.budget_change_action()}
    </span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">
          {m.budget_dialog_title()}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {m.budget_dialog_description({ name })}
        </Dialog.Description>
        <form
          method="POST"
          action="?/setBudget"
          class="flex flex-col gap-4"
          use:enhance={() => {
            submitting = true;
            return async ({ result, update }) => {
              await update({ reset: false });
              submitting = false;
              if (result.type === "success") open = false;
            };
          }}
        >
          <label class="label">
            <span class="label-text">{m.budget_amount_label()}</span>
            <input
              class="input"
              name="monthlyBudget"
              type="number"
              inputmode="decimal"
              min="0.01"
              step="any"
              autocomplete="off"
              value={budget ?? ""}
              placeholder={m.budget_amount_placeholder()}
            />
            <span class="text-xs text-surface-600-400">
              {m.budget_amount_hint()}
            </span>
          </label>
          {#if message}
            <p role="alert" class="text-sm text-error-600-400">{message}</p>
          {/if}
          <div class="flex flex-wrap justify-between gap-2">
            {#if budget !== undefined}
              <button
                type="submit"
                name="clear"
                value="1"
                formnovalidate
                class="btn preset-tonal-error"
                disabled={submitting}
              >
                {m.budget_remove_action()}
              </button>
            {:else}
              <span></span>
            {/if}
            <div class="flex gap-2">
              <Dialog.CloseTrigger class="btn preset-tonal">
                {m.common_cancel()}
              </Dialog.CloseTrigger>
              <button
                type="submit"
                class="btn preset-filled-surface-950-50"
                disabled={submitting}
              >
                {m.budget_save_action()}
              </button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

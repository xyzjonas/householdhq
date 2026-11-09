<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import { toaster } from "#lib/toaster.ts";

  let {
    id,
    description,
    recurring = false,
  }: {
    id: number;
    description: string;
    /** Confirming a recurring transaction schedules the next one. */
    recurring?: boolean;
  } = $props();

  let open = $state(false);
  let submitting = $state(false);
</script>

<button
  type="button"
  class="btn-icon preset-filled-success-500 btn-icon-sm"
  aria-label="Confirm {description}"
  title="Confirm"
  onclick={() => (open = true)}
>
  <CircleCheck size={16} aria-hidden="true" />
</button>

<Dialog
  {open}
  onOpenChange={(e) => {
    open = e.open;
  }}
>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold"
          >Confirm transaction?</Dialog.Title
        >
        <Dialog.Description class="text-sm text-surface-600-400">
          “{description}” will be marked as completed as of now and start
          counting towards your balances and spending.{recurring
            ? " The next occurrence will be scheduled."
            : ""}
        </Dialog.Description>
        <form
          method="POST"
          action="/transactions/{id}/edit?/confirm"
          class="flex justify-end gap-2"
          use:enhance={() => {
            submitting = true;
            return async ({ result }) => {
              if (result.type === "success") {
                toaster.success(
                  result.data?.scheduledNext
                    ? {
                        title: "Transaction confirmed",
                        description: "The next occurrence has been scheduled.",
                      }
                    : { title: "Transaction confirmed" },
                );
                // Stay on the current page, just refresh what it shows.
                await invalidateAll();
              } else {
                toaster.error({ title: "Could not confirm the transaction" });
              }
              submitting = false;
              open = false;
            };
          }}
        >
          <Dialog.CloseTrigger class="btn preset-tonal" disabled={submitting}
            >Cancel</Dialog.CloseTrigger
          >
          <button
            type="submit"
            class="btn preset-filled-success-500"
            disabled={submitting}
          >
            Confirm
          </button>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

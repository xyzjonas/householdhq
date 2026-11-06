<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import { formatMoney } from "#lib/format.ts";
  import { toaster } from "#lib/toaster.ts";

  let {
    accountName,
    suggested,
  }: {
    accountName: string;
    /** The balance the transactions add up to. */
    suggested: number;
  } = $props();

  let open = $state(false);
  let submitting = $state(false);
  let message = $state("");
  /** What the user typed; until they type, the computed balance applies. */
  let typed = $state<string | null>(null);

  const value = $derived(typed ?? String(suggested));
  const difference = $derived.by(() => {
    const amount = Number(value.replace(/\s/g, "").replace(",", "."));
    if (value.trim() === "" || !Number.isFinite(amount)) return null;
    return Math.round((amount - suggested) * 100) / 100;
  });

  function onOpenChange(e: { open: boolean }) {
    open = e.open;
    if (open) {
      typed = null;
      message = "";
    }
  }
</script>

<Dialog {open} {onOpenChange}>
  <Dialog.Trigger class="btn rounded-full preset-tonal text-xs font-bold">
    <CircleCheck size={16} aria-hidden="true" />
    <span>Add checkpoint</span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">Add checkpoint</Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          Freeze the balance of {accountName} as of now. The suggestion is the previous
          checkpoint plus the transactions since. Enter the real balance if it differs;
          the difference is booked as an adjustment.
        </Dialog.Description>
        <form
          method="POST"
          action="?/checkpoint"
          class="flex flex-col gap-4"
          use:enhance={() => {
            submitting = true;
            return async ({ result, update }) => {
              await update({ reset: false });
              submitting = false;
              if (result.type === "success") {
                open = false;
                toaster.success({ title: "Checkpoint added" });
              } else if (result.type === "failure") {
                message =
                  (result.data as { message?: string } | undefined)?.message ??
                  "Could not add the checkpoint.";
              } else {
                toaster.error({ title: "Could not add the checkpoint" });
              }
            };
          }}
        >
          <label class="label">
            <span class="label-text">Balance</span>
            <input
              class="input"
              type="text"
              inputmode="decimal"
              name="amount"
              required
              autocomplete="off"
              value={suggested}
              oninput={(e) => (typed = e.currentTarget.value)}
              aria-describedby="checkpoint-hint"
            />
          </label>
          <p id="checkpoint-hint" class="text-sm text-surface-600-400">
            {#if difference === null}
              Enter the current balance.
            {:else if difference === 0}
              Matches the computed balance of {formatMoney(suggested)}; no
              adjustment needed.
            {:else}
              Computed balance is {formatMoney(suggested)}. An adjustment of
              {difference > 0 ? "+" : "−"}{formatMoney(Math.abs(difference))} will
              be added.
            {/if}
          </p>
          {#if message}
            <p role="alert" class="text-sm text-error-600-400">{message}</p>
          {/if}
          <div class="flex justify-end gap-2">
            <Dialog.CloseTrigger class="btn preset-tonal"
              >Cancel</Dialog.CloseTrigger
            >
            <button
              type="submit"
              class="btn preset-filled-surface-950-50"
              disabled={submitting || difference === null}
            >
              Add checkpoint
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

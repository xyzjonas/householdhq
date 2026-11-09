<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { toaster } from "#lib/toaster.ts";
  import CategoryStage from "#lib/components/transaction-wizard/CategoryStage.svelte";
  import TagPicker from "#lib/components/transaction-wizard/TagPicker.svelte";
  import type {
    WizardCategory,
    WizardTag,
  } from "#lib/components/transaction-wizard/types.ts";

  let {
    name,
    transactionCount,
    others,
    tags,
  }: {
    name: string;
    /** Transactions currently filed under the category. */
    transactionCount: number;
    /** Categories the transactions can move to. */
    others: WizardCategory[];
    /** Existing tags, offered by the tag picker. */
    tags: WizardTag[];
  } = $props();

  let open = $state(false);
  let submitting = $state(false);
  let reassignTo = $state<number | null>(null);
  let tagNames = $state<string[]>([]);

  const needsTarget = $derived(transactionCount > 0);
  const noun = $derived(
    transactionCount === 1 ? "transaction" : "transactions",
  );
  const blocked = $derived(
    needsTarget && (others.length === 0 || reassignTo === null),
  );
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Trigger class="btn h-12 w-full preset-tonal-error">
    <Trash2 size={18} aria-hidden="true" />
    Delete category
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex max-h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">
          Delete “{name}”?
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {#if needsTarget}
            {transactionCount}
            {noun} currently filed under this category. Choose the category they should
            be moved to; the category is then permanently deleted. This can't be undone.
          {:else}
            No transactions use this category. It will be permanently deleted.
          {/if}
        </Dialog.Description>
        <form
          method="POST"
          action="?/removeCategory"
          class="flex flex-col gap-4"
          use:enhance={() => {
            submitting = true;
            return async ({ result, update }) => {
              submitting = false;
              if (result.type === "redirect") {
                toaster.success({
                  title: needsTarget
                    ? `Category deleted · ${transactionCount} ${noun} moved`
                    : "Category deleted",
                });
              } else if (result.type === "failure") {
                toaster.error({
                  title:
                    (result.data as { message?: string } | undefined)
                      ?.message ?? "Could not delete the category",
                });
                return;
              }
              await update();
            };
          }}
        >
          {#if needsTarget}
            <section class="flex flex-col gap-2">
              <h3 class="label-text">Move transactions to</h3>
              <CategoryStage categories={others} bind:value={reassignTo} />
              {#if reassignTo !== null}
                <input type="hidden" name="reassignTo" value={reassignTo} />
              {/if}
            </section>
            <section class="flex flex-col gap-2">
              <h3 class="label-text">Tags for the moved transactions</h3>
              <TagPicker bind:value={tagNames} options={tags} />
            </section>
          {/if}
          <div class="flex justify-end gap-2">
            <Dialog.CloseTrigger class="btn preset-tonal"
              >Cancel</Dialog.CloseTrigger
            >
            <button
              type="submit"
              class="btn preset-filled-error-500"
              disabled={submitting || blocked}
            >
              {needsTarget ? "Move & delete" : "Delete"}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

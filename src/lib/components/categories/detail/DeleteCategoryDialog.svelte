<script lang="ts">
  import { enhance } from "$app/forms";
  import { m } from "#paraglide/messages.js";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { toaster } from "#lib/toaster.ts";
  import TagPicker from "#lib/components/transaction-wizard/TagPicker.svelte";
  import type { WizardTag } from "#lib/components/transaction-wizard/types.ts";

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
    others: { id: number; name: string }[];
    /** Existing tags, offered by the tag picker. */
    tags: WizardTag[];
  } = $props();

  let open = $state(false);
  let submitting = $state(false);
  let reassignTo = $state("");
  let tagNames = $state<string[]>([]);

  const needsTarget = $derived(transactionCount > 0);
  const blocked = $derived(needsTarget && (others.length === 0 || !reassignTo));
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Trigger class="btn h-12 w-full preset-tonal-error">
    <Trash2 size={18} aria-hidden="true" />
    {m.categories_delete_button()}
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
          {m.categories_delete_title({ name })}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {#if needsTarget}
            {m.categories_delete_description_move({ count: transactionCount })}
          {:else}
            {m.categories_delete_description_empty()}
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
                    ? m.categories_deleted_moved({ count: transactionCount })
                    : m.categories_deleted(),
                });
              } else if (result.type === "failure") {
                toaster.error({
                  title:
                    (result.data as { message?: string } | undefined)
                      ?.message ?? m.categories_delete_failed(),
                });
                return;
              }
              await update();
            };
          }}
        >
          {#if needsTarget}
            <label class="label">
              <span class="label-text">{m.categories_delete_move_to()}</span>
              <select
                class="select"
                name="reassignTo"
                required
                bind:value={reassignTo}
              >
                <option value="" disabled>{m.categories_delete_select()}</option
                >
                {#each others as other (other.id)}
                  <option value={other.id}>{other.name}</option>
                {/each}
              </select>
            </label>
            <section class="flex flex-col gap-2">
              <h3 class="label-text">{m.categories_delete_tags()}</h3>
              <TagPicker bind:value={tagNames} options={tags} />
            </section>
          {/if}
          <div class="flex justify-end gap-2">
            <Dialog.CloseTrigger class="btn preset-tonal">
              {m.common_cancel()}
            </Dialog.CloseTrigger>
            <button
              type="submit"
              class="btn preset-filled-error-500"
              disabled={submitting || blocked}
            >
              {needsTarget
                ? m.categories_delete_move_and_delete()
                : m.common_delete()}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

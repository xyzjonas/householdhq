<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { toaster } from "#lib/toaster.ts";

  let { id, email }: { id: number; email: string } = $props();

  let open = $state(false);
  let submitting = $state(false);
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Trigger class="btn preset-tonal-error btn-sm">
    <Trash2 size={14} aria-hidden="true" />
    <span>Delete<span class="sr-only"> {email}</span></span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">Delete {email}?</Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          The account is permanently deleted and signed out everywhere. This
          can't be undone.
        </Dialog.Description>
        <form
          method="POST"
          action="?/remove"
          class="flex flex-col gap-4"
          use:enhance={() => {
            submitting = true;
            return async ({ result, update }) => {
              submitting = false;
              if (result.type === "failure") {
                toaster.error({
                  title: String(result.data?.message ?? "Could not delete"),
                });
                open = false;
                return;
              }
              if (result.type === "success") {
                toaster.success({ title: `Deleted ${email}` });
              }
              await update();
            };
          }}
        >
          <input type="hidden" name="id" value={id} />
          <div class="flex justify-end gap-2">
            <Dialog.CloseTrigger class="btn preset-tonal"
              >Cancel</Dialog.CloseTrigger
            >
            <button
              type="submit"
              class="btn preset-filled-error-500"
              disabled={submitting}
            >
              Delete user
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

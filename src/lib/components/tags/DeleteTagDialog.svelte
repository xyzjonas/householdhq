<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { toaster } from "#lib/toaster.ts";

  let { name }: { name: string } = $props();

  let open = $state(false);
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Trigger class="btn preset-tonal-error">
    <Trash2 size={16} aria-hidden="true" />
    <span>Delete tag</span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">Delete tag?</Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          “{name}” will be removed from every transaction that carries it. The
          transactions themselves are kept.
        </Dialog.Description>
        <form
          method="POST"
          action="?/deleteTag"
          class="flex justify-end gap-2"
          use:enhance={() =>
            async ({ result, update }) => {
              if (result.type === "redirect") {
                toaster.success({ title: `Deleted tag “${name}”` });
              } else {
                open = false;
                toaster.error({ title: "Could not delete the tag" });
              }
              await update();
            }}
        >
          <Dialog.CloseTrigger class="btn preset-tonal"
            >Cancel</Dialog.CloseTrigger
          >
          <button type="submit" class="btn preset-filled-error-500">
            Delete
          </button>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

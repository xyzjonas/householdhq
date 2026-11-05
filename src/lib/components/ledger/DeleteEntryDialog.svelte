<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "#lib/toaster.ts";

  /** The entry awaiting confirmation; `null` keeps the dialog closed. */
  let {
    entry = $bindable(),
  }: { entry: { id: number; description: string } | null } = $props();
</script>

<Dialog
  open={entry !== null}
  onOpenChange={(e) => {
    if (!e.open) entry = null;
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
        <Dialog.Title class="text-lg font-bold">Delete entry?</Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          “{entry?.description}” will be permanently removed from the journal.
        </Dialog.Description>
        <form
          method="POST"
          action="?/delete"
          class="flex justify-end gap-2"
          use:enhance={() =>
            async ({ result, update }) => {
              const description = entry?.description;
              entry = null;
              if (result.type === "success") {
                toaster.success({ title: `Deleted “${description}”` });
              } else {
                toaster.error({ title: "Could not delete the entry" });
              }
              await update();
            }}
        >
          <input type="hidden" name="id" value={entry?.id} />
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

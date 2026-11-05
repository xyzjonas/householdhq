<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "#lib/toaster.ts";

  let {
    open = $bindable(false),
    description,
  }: {
    open: boolean;
    /** Shown in the confirmation text. */
    description: string;
  } = $props();
</script>

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
          >Delete transaction?</Dialog.Title
        >
        <Dialog.Description class="text-sm text-surface-600-400">
          {description
            ? `“${description}” will be permanently removed from the journal.`
            : "This transaction will be permanently removed from the journal."}
        </Dialog.Description>
        <form
          method="POST"
          action="?/delete"
          class="flex justify-end gap-2"
          use:enhance={() =>
            async ({ result, update }) => {
              if (result.type === "redirect" || result.type === "success") {
                toaster.success({ title: "Transaction deleted" });
              } else {
                open = false;
                toaster.error({ title: "Could not delete the transaction" });
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

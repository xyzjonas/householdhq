<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "#lib/toaster.ts";

  /** The entry awaiting confirmation; `null` keeps the dialog closed. */
  let {
    entry = $bindable(),
    action = "?/delete",
    kind = "entry",
  }: {
    entry: { id: number; description: string } | null;
    /** Form action that performs the deletion. */
    action?: string;
    /** What is being deleted, for the dialog title and error toast. */
    kind?: "entry" | "checkpoint";
  } = $props();
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
        <Dialog.Title class="text-lg font-bold">
          {kind === "entry"
            ? m.ledger_delete_title_entry()
            : m.ledger_delete_title_checkpoint()}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {m.ledger_delete_description({
            description: entry?.description ?? "",
          })}
        </Dialog.Description>
        <form
          method="POST"
          {action}
          class="flex justify-end gap-2"
          use:enhance={() =>
            async ({ result, update }) => {
              const description = entry?.description;
              entry = null;
              if (result.type === "success") {
                toaster.success({
                  title: m.ledger_delete_success({
                    description: description ?? "",
                  }),
                });
              } else {
                toaster.error({
                  title:
                    kind === "entry"
                      ? m.ledger_delete_failed_entry()
                      : m.ledger_delete_failed_checkpoint(),
                });
              }
              await update();
            }}
        >
          <input type="hidden" name="id" value={entry?.id} />
          <Dialog.CloseTrigger class="btn preset-tonal"
            >{m.common_cancel()}</Dialog.CloseTrigger
          >
          <button type="submit" class="btn preset-filled-error-500">
            {m.common_delete()}
          </button>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

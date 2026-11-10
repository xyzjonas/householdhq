<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "#lib/toaster.ts";

  /** The reading awaiting confirmation; `null` keeps the dialog closed. */
  let {
    reading = $bindable(),
  }: { reading: { id: number; label: string } | null } = $props();
</script>

<Dialog
  open={reading !== null}
  onOpenChange={(e) => {
    if (!e.open) reading = null;
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
          >{m.energy_delete_title()}</Dialog.Title
        >
        <Dialog.Description class="text-sm text-surface-600-400">
          {m.energy_delete_text({ date: reading?.label ?? "" })}
        </Dialog.Description>
        <form
          method="POST"
          action="?/deleteReading"
          class="flex justify-end gap-2"
          use:enhance={() =>
            async ({ result, update }) => {
              reading = null;
              if (result.type === "success") {
                toaster.success({ title: m.energy_delete_done() });
              } else {
                toaster.error({ title: m.energy_delete_failed() });
              }
              await update();
            }}
        >
          <input type="hidden" name="id" value={reading?.id} />
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

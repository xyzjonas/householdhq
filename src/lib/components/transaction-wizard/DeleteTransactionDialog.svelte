<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "#lib/toaster.ts";
  import { m } from "#paraglide/messages.js";

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
          >{m.wizard_delete_title()}</Dialog.Title
        >
        <Dialog.Description class="text-sm text-surface-600-400">
          {description
            ? m.wizard_delete_description_named({ description })
            : m.wizard_delete_description()}
        </Dialog.Description>
        <form
          method="POST"
          action="?/delete"
          class="flex justify-end gap-2"
          use:enhance={() =>
            async ({ result, update }) => {
              if (result.type === "redirect" || result.type === "success") {
                toaster.success({ title: m.wizard_delete_toast_success() });
              } else {
                open = false;
                toaster.error({ title: m.wizard_delete_toast_error() });
              }
              await update();
            }}
        >
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

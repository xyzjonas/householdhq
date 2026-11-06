<script lang="ts" module>
  export interface DeleteTarget {
    /** The form action, e.g. `?/deleteFuel`. */
    action: string;
    /** Posted as `id` when set. */
    id?: number;
    title: string;
    description: string;
    /** Toast shown once it is gone. */
    done: string;
  }
</script>

<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "#lib/toaster.ts";

  /** What awaits confirmation; `null` keeps the dialog closed. */
  let { target = $bindable() }: { target: DeleteTarget | null } = $props();
</script>

<Dialog
  open={target !== null}
  onOpenChange={(e) => {
    if (!e.open) target = null;
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
        <Dialog.Title class="text-lg font-bold">{target?.title}</Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {target?.description}
        </Dialog.Description>
        <form
          method="POST"
          action={target?.action}
          class="flex justify-end gap-2"
          use:enhance={() =>
            async ({ result, update }) => {
              const done = target?.done;
              target = null;
              if (result.type === "success" || result.type === "redirect") {
                if (done) toaster.success({ title: done });
              } else {
                toaster.error({
                  title:
                    (result.type === "failure"
                      ? (result.data as { message?: string } | undefined)
                          ?.message
                      : undefined) ?? "Could not delete",
                });
              }
              await update();
            }}
        >
          {#if target?.id !== undefined}
            <input type="hidden" name="id" value={target.id} />
          {/if}
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

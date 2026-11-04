<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Plus from "@lucide/svelte/icons/plus";

  let { message = "" }: { message?: string } = $props();

  let open = $state(false);
  let submitting = $state(false);
</script>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Dialog.Trigger class="btn preset-filled-surface-950-50">
    <Plus size={16} aria-hidden="true" />
    <span>New category</span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">New category</Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          Give the category a name. It will show up in the directory right away.
        </Dialog.Description>
        <form
          method="POST"
          action="?/create"
          class="flex flex-col gap-4"
          use:enhance={() => {
            submitting = true;
            return async ({ result, update }) => {
              await update();
              submitting = false;
              if (result.type === "redirect") open = false;
            };
          }}
        >
          <label class="label">
            <span class="label-text">Category name</span>
            <input
              class="input"
              name="name"
              type="text"
              required
              maxlength="100"
              autocomplete="off"
              placeholder="e.g. Groceries"
            />
          </label>
          {#if message}
            <p role="alert" class="text-sm text-error-600-400">{message}</p>
          {/if}
          <div class="flex justify-end gap-2">
            <Dialog.CloseTrigger class="btn preset-tonal"
              >Cancel</Dialog.CloseTrigger
            >
            <button
              type="submit"
              class="btn preset-filled-surface-950-50"
              disabled={submitting}
            >
              Create category
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

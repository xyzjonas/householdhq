<script lang="ts">
  import { m } from "#paraglide/messages.js";
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
    <span>{m.accounts_create_trigger()}</span>
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
          {m.accounts_create_title()}
        </Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          {m.accounts_create_description()}
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
            <span class="label-text">{m.accounts_create_name_label()}</span>
            <input
              class="input"
              name="name"
              type="text"
              required
              maxlength="100"
              autocomplete="off"
              placeholder={m.accounts_create_name_placeholder()}
            />
          </label>
          {#if message}
            <p role="alert" class="text-sm text-error-600-400">{message}</p>
          {/if}
          <div class="flex justify-end gap-2">
            <Dialog.CloseTrigger class="btn preset-tonal"
              >{m.common_cancel()}</Dialog.CloseTrigger
            >
            <button
              type="submit"
              class="btn preset-filled-surface-950-50"
              disabled={submitting}
            >
              {m.accounts_create_submit()}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

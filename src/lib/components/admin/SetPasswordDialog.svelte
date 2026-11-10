<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import KeyRound from "@lucide/svelte/icons/key-round";
  import { toaster } from "#lib/toaster.ts";

  let { id, email }: { id: number; email: string } = $props();

  let open = $state(false);
  let submitting = $state(false);
  let message = $state("");
</script>

<Dialog
  {open}
  onOpenChange={(e) => {
    open = e.open;
    message = "";
  }}
>
  <Dialog.Trigger class="btn preset-tonal btn-sm">
    <KeyRound size={14} aria-hidden="true" />
    <span>Set password<span class="sr-only"> for {email}</span></span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">Set password</Dialog.Title>
        <Dialog.Description class="text-sm text-surface-600-400">
          Choose a new password for {email}. They are signed out everywhere.
        </Dialog.Description>
        <form
          method="POST"
          action="?/setPassword"
          class="flex flex-col gap-4"
          use:enhance={() => {
            submitting = true;
            message = "";
            return async ({ result, update }) => {
              submitting = false;
              if (result.type === "failure") {
                message = String(result.data?.message ?? "Could not save");
                return;
              }
              if (result.type === "success") {
                open = false;
                toaster.success({ title: `Password changed for ${email}` });
              }
              await update();
            };
          }}
        >
          <input type="hidden" name="id" value={id} />
          <label class="label">
            <span class="label-text">New password</span>
            <input
              class="input"
              name="password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
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
              Change password
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

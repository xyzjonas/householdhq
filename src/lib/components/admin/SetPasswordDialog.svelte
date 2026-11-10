<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import KeyRound from "@lucide/svelte/icons/key-round";
  import { toaster } from "#lib/toaster.ts";
  import { m } from "#paraglide/messages.js";

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
    <span
      >{m.users_set_password_title()}<span class="sr-only">
        {m.users_for_email({ email })}</span
      ></span
    >
  </Dialog.Trigger>
  <Portal>
    {#if open}
      <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
      <Dialog.Positioner
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <Dialog.Content
          class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
        >
          <Dialog.Title class="text-lg font-bold"
            >{m.users_set_password_title()}</Dialog.Title
          >
          <Dialog.Description class="text-sm text-surface-600-400">
            {m.users_set_password_description({ email })}
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
                  message = String(
                    result.data?.message ?? m.users_set_password_failed(),
                  );
                  return;
                }
                if (result.type === "success") {
                  open = false;
                  toaster.success({
                    title: m.users_set_password_success({ email }),
                  });
                }
                await update();
              };
            }}
          >
            <input type="hidden" name="id" value={id} />
            <label class="label">
              <span class="label-text">{m.users_set_password_label()}</span>
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
                >{m.common_cancel()}</Dialog.CloseTrigger
              >
              <button
                type="submit"
                class="btn preset-filled-surface-950-50"
                disabled={submitting}
              >
                {m.users_set_password_submit()}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    {/if}
  </Portal>
</Dialog>

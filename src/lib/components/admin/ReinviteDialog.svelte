<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Link from "@lucide/svelte/icons/link";
  import InviteLink from "./InviteLink.svelte";
  import { m } from "#paraglide/messages.js";

  let { id, email }: { id: number; email: string } = $props();

  let open = $state(false);
  let submitting = $state(false);
  let message = $state("");
  let invite = $state<{ email: string; token: string } | null>(null);
</script>

<Dialog
  {open}
  onOpenChange={(e) => {
    open = e.open;
    if (!open) {
      invite = null;
      message = "";
    }
  }}
>
  <Dialog.Trigger class="btn preset-tonal btn-sm">
    <Link size={14} aria-hidden="true" />
    <span
      >{m.users_reinvite_title()}<span class="sr-only">
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
            >{m.users_reinvite_title()}</Dialog.Title
          >
          {#if invite}
            <InviteLink email={invite.email} token={invite.token} />
            <div class="flex justify-end">
              <Dialog.CloseTrigger class="btn preset-filled-surface-950-50"
                >{m.common_done()}</Dialog.CloseTrigger
              >
            </div>
          {:else}
            <Dialog.Description class="text-sm text-surface-600-400">
              {m.users_reinvite_description({ email })}
            </Dialog.Description>
            <form
              method="POST"
              action="?/reinvite"
              class="flex flex-col gap-4"
              use:enhance={() => {
                submitting = true;
                message = "";
                return async ({ result, update }) => {
                  submitting = false;
                  if (result.type === "success" && result.data?.invite) {
                    invite = result.data.invite as typeof invite;
                  } else if (result.type === "failure") {
                    message = String(
                      result.data?.message ?? m.users_reinvite_failed(),
                    );
                  }
                  await update({ reset: false });
                };
              }}
            >
              <input type="hidden" name="id" value={id} />
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
                  {m.users_reinvite_submit()}
                </button>
              </div>
            </form>
          {/if}
        </Dialog.Content>
      </Dialog.Positioner>
    {/if}
  </Portal>
</Dialog>

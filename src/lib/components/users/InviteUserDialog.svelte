<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import UserPlus from "@lucide/svelte/icons/user-plus";
  import InviteLink from "./InviteLink.svelte";

  let open = $state(false);
  let submitting = $state(false);
  let message = $state("");
  let invite = $state<{ email: string; token: string } | null>(null);

  function onOpenChange(e: { open: boolean }) {
    open = e.open;
    if (!open) {
      invite = null;
      message = "";
    }
  }
</script>

<Dialog {open} {onOpenChange}>
  <Dialog.Trigger class="btn preset-filled-surface-950-50">
    <UserPlus size={16} aria-hidden="true" />
    <span>Invite user</span>
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
    <Dialog.Positioner
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Content
        class="flex w-full max-w-md flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
      >
        <Dialog.Title class="text-lg font-bold">Invite user</Dialog.Title>
        {#if invite}
          <InviteLink email={invite.email} token={invite.token} />
          <div class="flex justify-end">
            <Dialog.CloseTrigger class="btn preset-filled-surface-950-50"
              >Done</Dialog.CloseTrigger
            >
          </div>
        {:else}
          <Dialog.Description class="text-sm text-surface-600-400">
            Creates the account with a random password and gives you a link the
            new user opens to choose their own.
          </Dialog.Description>
          <form
            method="POST"
            action="?/invite"
            class="flex flex-col gap-4"
            use:enhance={() => {
              submitting = true;
              message = "";
              return async ({ result, update }) => {
                submitting = false;
                if (result.type === "success" && result.data?.invite) {
                  invite = result.data.invite as typeof invite;
                } else if (result.type === "failure") {
                  message = String(result.data?.message ?? "Could not invite");
                }
                await update({ reset: false });
              };
            }}
          >
            <label class="label">
              <span class="label-text">Email</span>
              <input
                class="input"
                name="email"
                type="email"
                required
                autocomplete="off"
                placeholder="e.g. partner@example.com"
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
                Create invite
              </button>
            </div>
          </form>
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

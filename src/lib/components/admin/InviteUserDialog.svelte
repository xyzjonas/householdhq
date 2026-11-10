<script lang="ts">
  import { enhance } from "$app/forms";
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import UserPlus from "@lucide/svelte/icons/user-plus";
  import InviteLink from "./InviteLink.svelte";
  import { m } from "#paraglide/messages.js";

  let {
    households,
    defaultHouseholdId = null,
    label,
  }: {
    households: { id: number; name: string }[];
    /** Preselected household, e.g. the one a branch of the tree belongs to. */
    defaultHouseholdId?: number | null;
    label?: string;
  } = $props();

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
  <Dialog.Trigger class="btn max-w-full min-w-0 preset-filled-surface-950-50">
    <UserPlus size={16} aria-hidden="true" class="shrink-0" />
    <span class="truncate" title={label ?? m.users_invite_title()}
      >{label ?? m.users_invite_title()}</span
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
            >{m.users_invite_title()}</Dialog.Title
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
              {m.admin_invite_description()}
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
                    message = String(
                      result.data?.message ?? m.users_invite_failed(),
                    );
                  }
                  await update({ reset: false });
                };
              }}
            >
              <label class="label">
                <span class="label-text">{m.admin_invite_email_label()}</span>
                <input
                  class="input"
                  name="email"
                  type="email"
                  required
                  autocomplete="off"
                  placeholder={m.users_invite_email_placeholder()}
                />
              </label>
              <label class="label">
                <span class="label-text"
                  >{m.admin_invite_household_label()}</span
                >
                <select class="select" name="householdId">
                  <option value="">{m.admin_invite_no_household()}</option>
                  {#each households as household (household.id)}
                    <option
                      value={household.id}
                      selected={household.id === defaultHouseholdId}
                    >
                      {household.name}
                    </option>
                  {/each}
                </select>
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
                  {m.users_invite_submit()}
                </button>
              </div>
            </form>
          {/if}
        </Dialog.Content>
      </Dialog.Positioner>
    {/if}
  </Portal>
</Dialog>

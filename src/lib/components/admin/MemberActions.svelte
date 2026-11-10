<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PublicUser } from "#lib/server/core/types.ts";
  import DeleteUserDialog from "./DeleteUserDialog.svelte";
  import ReinviteDialog from "./ReinviteDialog.svelte";
  import SetPasswordDialog from "./SetPasswordDialog.svelte";
  import { m } from "#paraglide/messages.js";

  let {
    user,
    isSelf,
    household,
  }: {
    user: PublicUser;
    isSelf: boolean;
    /** The household the row belongs to; none for users without one. */
    household?: { id: number; name: string };
  } = $props();
</script>

<div class="flex flex-wrap gap-2">
  {#if household}
    <form
      method="POST"
      action="?/removeMember"
      use:enhance={() =>
        async ({ update }) =>
          update({ reset: false })}
    >
      <input type="hidden" name="householdId" value={household.id} />
      <input type="hidden" name="userId" value={user.id} />
      <button
        type="submit"
        class="btn preset-tonal btn-sm"
        aria-label={m.admin_remove_member_label({
          email: user.email,
          household: household.name,
        })}
      >
        {m.admin_remove()}
      </button>
    </form>
  {/if}
  <SetPasswordDialog id={user.id} email={user.email} />
  {#if !isSelf}
    <ReinviteDialog id={user.id} email={user.email} />
    <DeleteUserDialog id={user.id} email={user.email} />
  {/if}
</div>

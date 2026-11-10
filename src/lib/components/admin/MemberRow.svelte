<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PublicUser } from "#lib/server/core/types.ts";
  import DeleteUserDialog from "./DeleteUserDialog.svelte";
  import ReinviteDialog from "./ReinviteDialog.svelte";
  import SetPasswordDialog from "./SetPasswordDialog.svelte";

  let {
    user,
    isSelf,
    household,
  }: {
    user: PublicUser;
    isSelf: boolean;
    /** The household this row sits under; none for users without one. */
    household?: { id: number; name: string };
  } = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3 py-2">
  <div class="flex min-w-0 flex-col gap-1">
    <p class="truncate font-bold tracking-tight" title={user.email}>
      {user.email}
    </p>
    <p class="flex flex-wrap gap-2 text-xs text-surface-600-400">
      <span>{user.isSuperuser ? "Superuser" : "User"}</span>
      {#if isSelf}<span>· You</span>{/if}
    </p>
  </div>
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
          aria-label="Remove {user.email} from {household.name}"
        >
          Remove
        </button>
      </form>
    {/if}
    <SetPasswordDialog id={user.id} email={user.email} />
    {#if !isSelf}
      <ReinviteDialog id={user.id} email={user.email} />
      <DeleteUserDialog id={user.id} email={user.email} />
    {/if}
  </div>
</div>

<script lang="ts">
  import type { PublicUser } from "#lib/server/core/types.ts";
  import DeleteUserDialog from "./DeleteUserDialog.svelte";
  import ReinviteDialog from "./ReinviteDialog.svelte";
  import SetPasswordDialog from "./SetPasswordDialog.svelte";

  let {
    users,
    currentUserId,
  }: { users: PublicUser[]; currentUserId?: number } = $props();
</script>

<ul class="divide-y divide-surface-200-800 card border border-surface-200-800">
  {#each users as user (user.id)}
    {@const isSelf = user.id === currentUserId}
    <li
      class="flex flex-wrap items-center justify-between gap-3 p-4"
      data-testid="user-row"
    >
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
        <SetPasswordDialog id={user.id} email={user.email} />
        {#if !isSelf}
          <ReinviteDialog id={user.id} email={user.email} />
          <DeleteUserDialog id={user.id} email={user.email} />
        {/if}
      </div>
    </li>
  {/each}
</ul>

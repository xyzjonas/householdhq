<script lang="ts">
  import type { PublicUser } from "#lib/server/core/types.ts";
  import MemberActions from "./MemberActions.svelte";

  let {
    users,
    currentUserId,
    household,
    caption,
  }: {
    users: PublicUser[];
    currentUserId?: number;
    household?: { id: number; name: string };
    caption: string;
  } = $props();
</script>

<div class="hidden overflow-x-auto card border border-surface-200-800 lg:block">
  <table class="w-full text-left text-sm">
    <caption class="sr-only">{caption}</caption>
    <thead
      class="bg-surface-100-900 text-xs tracking-wider text-surface-600-400 uppercase"
    >
      <tr>
        <th scope="col" class="w-2/5 px-4 py-3 font-bold">User</th>
        <th scope="col" class="px-4 py-3 font-bold">Role</th>
        <th scope="col" class="px-4 py-3 text-right font-bold">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-surface-200-800">
      {#each users as user (user.id)}
        <tr class="transition-colors hover:bg-surface-100-900">
          <th scope="row" class="px-4 py-3 font-normal">
            <span
              class="block max-w-xs truncate text-sm font-bold tracking-tight"
              title={user.email}
            >
              {user.email}
            </span>
            {#if user.id === currentUserId}
              <span class="block text-xs text-slate-400">You</span>
            {/if}
          </th>
          <td class="px-4 py-3 text-slate-500">
            {user.isSuperuser ? "Superuser" : "User"}
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-end">
              <MemberActions
                {user}
                isSelf={user.id === currentUserId}
                {household}
              />
            </div>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="3" class="px-4 py-8 text-center text-sm opacity-70">
            Nobody belongs here yet.
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

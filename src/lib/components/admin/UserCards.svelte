<script lang="ts">
  import type { PublicUser } from "#lib/server/core/types.ts";
  import MemberActions from "./MemberActions.svelte";
  import { m } from "#paraglide/messages.js";

  let {
    users,
    currentUserId,
    household,
  }: {
    users: PublicUser[];
    currentUserId?: number;
    household?: { id: number; name: string };
  } = $props();
</script>

<ul class="flex flex-col gap-3 lg:hidden">
  {#each users as user (user.id)}
    <li>
      <article
        class="flex flex-col gap-3 card border border-surface-200-800 p-4"
      >
        <div class="min-w-0">
          <h3
            class="truncate text-sm font-bold tracking-tight"
            title={user.email}
          >
            {user.email}
          </h3>
          <p class="text-xs text-slate-500">
            {user.isSuperuser ? m.users_role_superuser() : m.users_role_user()}
            {#if user.id === currentUserId}· {m.users_you()}{/if}
          </p>
        </div>
        <MemberActions {user} isSelf={user.id === currentUserId} {household} />
      </article>
    </li>
  {:else}
    <li class="text-sm opacity-70">{m.admin_nobody_here()}</li>
  {/each}
</ul>

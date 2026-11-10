<script lang="ts">
  import type { PublicUser } from "#lib/server/core/types.ts";
  import MemberActions from "./MemberActions.svelte";

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
            {user.isSuperuser ? "Superuser" : "User"}
            {#if user.id === currentUserId}· You{/if}
          </p>
        </div>
        <MemberActions {user} isSelf={user.id === currentUserId} {household} />
      </article>
    </li>
  {:else}
    <li class="text-sm opacity-70">Nobody belongs here yet.</li>
  {/each}
</ul>

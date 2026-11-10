<script lang="ts">
  import { resolve } from "$app/paths";
  import InviteUserDialog from "#lib/components/users/InviteUserDialog.svelte";
  import UserList from "#lib/components/users/UserList.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head><title>Users · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
        <ol class="flex gap-2">
          <li><a class="anchor" href={resolve("/")}>Home</a></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Users ({data.users.length} total)</li>
        </ol>
      </nav>
      <h1 class="text-2xl font-extrabold tracking-tight">Users</h1>
      <p class="text-sm text-surface-600-400">
        Invite people to the household and manage their passwords.
      </p>
    </div>
    <InviteUserDialog />
  </header>

  <UserList users={data.users} currentUserId={data.currentUserId} />
</div>

<script lang="ts">
  import { enhance } from "$app/forms";
  import type {
    HouseholdWithMembers,
    PublicUser,
  } from "#lib/server/core/types.ts";
  import InviteUserDialog from "./InviteUserDialog.svelte";
  import type { AdminFeedback } from "./types";

  let {
    household,
    users,
    households,
    feedback,
  }: {
    household: HouseholdWithMembers;
    users: PublicUser[];
    households: { id: number; name: string }[];
    feedback: AdminFeedback | null;
  } = $props();

  const mine = $derived(
    feedback?.householdId === household.id ? feedback : null,
  );
  const candidates = $derived(
    users.filter((u) => !household.members.some((m) => m.id === u.id)),
  );
</script>

<div
  class="flex flex-col gap-3 py-2"
  role="group"
  aria-label="Manage {household.name}"
>
  <form
    method="POST"
    action="?/renameHousehold"
    class="flex items-end gap-2"
    use:enhance={() =>
      async ({ update }) =>
        update({ reset: false })}
  >
    <input type="hidden" name="householdId" value={household.id} />
    <label class="label flex-1">
      <span class="label-text">Name</span>
      <input
        class="input"
        name="name"
        autocomplete="off"
        required
        value={household.name}
      />
    </label>
    <button type="submit" class="btn preset-tonal">Rename</button>
  </form>

  <div class="flex flex-wrap items-end gap-2">
    {#if candidates.length > 0}
      <form
        method="POST"
        action="?/addMember"
        class="flex flex-1 items-end gap-2"
        use:enhance
      >
        <input type="hidden" name="householdId" value={household.id} />
        <label class="label flex-1">
          <span class="label-text">Add an existing user</span>
          <select class="select" name="userId" required>
            <option value="">Choose…</option>
            {#each candidates as user (user.id)}
              <option value={user.id}>{user.email}</option>
            {/each}
          </select>
        </label>
        <button type="submit" class="btn preset-tonal">Add</button>
      </form>
    {/if}
    <InviteUserDialog
      {households}
      defaultHouseholdId={household.id}
      label="Invite to {household.name}"
    />
  </div>

  {#if mine?.message}
    <p role="alert" class="text-sm text-error-600-400">{mine.message}</p>
  {:else if mine?.saved}
    <p role="status" class="text-sm text-success-600-400">Saved.</p>
  {/if}
</div>

<script lang="ts">
  import { enhance } from "$app/forms";
  import type {
    HouseholdWithMembers,
    PublicUser,
  } from "#lib/server/core/types.ts";
  import type { AdminFeedback } from "./types";

  let {
    household,
    users,
    feedback,
  }: {
    household: HouseholdWithMembers;
    users: PublicUser[];
    feedback: AdminFeedback | null;
  } = $props();

  const mine = $derived(
    feedback?.householdId === household.id ? feedback : null,
  );
  const candidates = $derived(
    users.filter((u) => !household.members.some((m) => m.id === u.id)),
  );
  const headingId = $derived(`household-${household.id}`);
</script>

<article
  class="flex flex-col gap-4 card bg-surface-50-950 p-6"
  aria-labelledby={headingId}
>
  <header class="flex flex-col gap-3">
    <h3 id={headingId} class="text-lg font-bold">{household.name}</h3>
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
  </header>

  <section class="flex flex-col gap-2" aria-label="Members of {household.name}">
    <h4 class="text-sm font-bold opacity-70">Members</h4>
    {#if household.members.length === 0}
      <p class="text-sm text-surface-600-400">Nobody belongs here yet.</p>
    {:else}
      <ul class="flex flex-col gap-1">
        {#each household.members as member (member.id)}
          <li class="flex items-center justify-between gap-2">
            <span class="min-w-0 truncate" title={member.email}>
              {member.email}
              {#if member.isSuperuser}
                <span class="text-xs opacity-70">(admin)</span>
              {/if}
            </span>
            <form
              method="POST"
              action="?/removeMember"
              use:enhance={() =>
                async ({ update }) =>
                  update({ reset: false })}
            >
              <input type="hidden" name="householdId" value={household.id} />
              <input type="hidden" name="userId" value={member.id} />
              <button
                type="submit"
                class="btn preset-tonal btn-sm"
                aria-label="Remove {member.email} from {household.name}"
              >
                Remove
              </button>
            </form>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if candidates.length > 0}
    <form
      method="POST"
      action="?/addMember"
      class="flex items-end gap-2"
      use:enhance
    >
      <input type="hidden" name="householdId" value={household.id} />
      <label class="label flex-1">
        <span class="label-text">Add a user</span>
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

  {#if mine?.message}
    <p role="alert" class="text-sm text-error-600-400">{mine.message}</p>
  {:else if mine?.saved}
    <p role="status" class="text-sm text-success-600-400">Saved.</p>
  {/if}
</article>

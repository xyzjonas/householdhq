<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PublicUser } from "#lib/server/core/types.ts";
  import CategoryGlyph from "../categories/CategoryGlyph.svelte";
  import HouseholdDialog from "./HouseholdDialog.svelte";
  import InviteUserDialog from "./InviteUserDialog.svelte";
  import type { AdminSection } from "./sections";
  import type { AdminFeedback } from "./types";
  import UserCards from "./UserCards.svelte";
  import UserTable from "./UserTable.svelte";

  let {
    section,
    users,
    households,
    currentUserId,
    feedback,
  }: {
    section: AdminSection;
    /** Everyone, to pick from when adding an existing user. */
    users: PublicUser[];
    households: { id: number; name: string }[];
    currentUserId?: number;
    feedback: AdminFeedback | null;
  } = $props();

  const household = $derived(section.household);
  const mine = $derived(
    household && feedback?.householdId === household.id ? feedback : null,
  );
  const candidates = $derived(
    household
      ? users.filter((u) => !household.members.some((m) => m.id === u.id))
      : [],
  );
  const headingId = $derived(`${section.key}-heading`);
  const count = $derived(section.users.length);
</script>

<section class="flex flex-col gap-4" aria-labelledby={headingId}>
  <header class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex min-w-0 items-center gap-3">
      {#if household}
        <CategoryGlyph icon={household.icon} color={household.color} />
      {/if}
      <div class="min-w-0">
        <h2
          id={headingId}
          class="truncate text-lg font-bold tracking-tight"
          title={section.title}
        >
          {section.title}
        </h2>
        <p class="text-xs text-slate-500">
          {count}
          {count === 1 ? "user" : "users"}
        </p>
      </div>
    </div>
    {#if household}
      <div class="flex max-w-full min-w-0 flex-wrap items-center gap-2">
        <HouseholdDialog {household} />
        <InviteUserDialog
          {households}
          defaultHouseholdId={household.id}
          label="Invite to {household.name}"
        />
      </div>
    {/if}
  </header>

  <UserTable
    users={section.users}
    {currentUserId}
    household={household && { id: household.id, name: household.name }}
    caption="Users of {section.title}"
  />
  <UserCards
    users={section.users}
    {currentUserId}
    household={household && { id: household.id, name: household.name }}
  />

  {#if household && candidates.length > 0}
    <form
      method="POST"
      action="?/addMember"
      class="flex items-end gap-2"
      use:enhance
    >
      <input type="hidden" name="householdId" value={household.id} />
      <label class="label min-w-0 flex-1">
        <span class="label-text block truncate">
          Add an existing user to {household.name}
        </span>
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
  {/if}
</section>

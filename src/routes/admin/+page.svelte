<script lang="ts">
  import { resolve } from "$app/paths";
  import CreateHouseholdForm from "#lib/components/admin/CreateHouseholdForm.svelte";
  import HouseholdSection from "#lib/components/admin/HouseholdSection.svelte";
  import InviteUserDialog from "#lib/components/admin/InviteUserDialog.svelte";
  import { buildSections } from "#lib/components/admin/sections.ts";
  import type { AdminFeedback } from "#lib/components/admin/types.ts";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
  const feedback = $derived(form as AdminFeedback | null);
  const sections = $derived(buildSections(data.households, data.users));
  const choices = $derived(
    data.households.map(({ id, name }) => ({ id, name })),
  );
</script>

<svelte:head><title>Administration · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      {#if data.households.length > 0}
        <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
          <ol class="flex gap-2">
            <li><a class="anchor" href={resolve("/")}>Home</a></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">
              Administration ({data.households.length}
              {data.households.length === 1 ? "household" : "households"}, {data
                .users.length}
              {data.users.length === 1 ? "user" : "users"})
            </li>
          </ol>
        </nav>
      {/if}
      <h1 class="text-2xl font-extrabold tracking-tight">Administration</h1>
      <p class="max-w-2xl text-sm text-surface-600-400">
        Households are completely separate: members only ever see the data of
        the households they belong to. Invite people, manage their passwords and
        decide who belongs where.
      </p>
    </div>
    <InviteUserDialog
      households={choices}
      defaultHouseholdId={data.activeHouseholdId}
    />
  </header>

  {#each sections as section (section.key)}
    <HouseholdSection
      {section}
      users={data.users}
      households={choices}
      currentUserId={data.currentUserId}
      {feedback}
    />
  {/each}

  <CreateHouseholdForm {feedback} />
</div>

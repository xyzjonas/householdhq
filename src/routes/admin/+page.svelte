<script lang="ts">
  import { resolve } from "$app/paths";
  import CreateHouseholdForm from "#lib/components/admin/CreateHouseholdForm.svelte";
  import HouseholdTree from "#lib/components/admin/HouseholdTree.svelte";
  import InviteUserDialog from "#lib/components/admin/InviteUserDialog.svelte";
  import type { AdminFeedback } from "#lib/components/admin/types.ts";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
  const feedback = $derived(form as AdminFeedback | null);
</script>

<svelte:head><title>Administration · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-4xl flex-col gap-6">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      {#if data.households.length > 0}
        <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
          <ol class="flex gap-2">
            <li><a class="anchor" href={resolve("/")}>Home</a></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">Administration</li>
          </ol>
        </nav>
      {/if}
      <h1 class="text-2xl font-extrabold tracking-tight">Administration</h1>
      <p class="text-surface-600-400">
        Households are completely separate: members only ever see the data of
        the households they belong to. Invite people, manage their passwords and
        decide who belongs where.
      </p>
    </div>
    <InviteUserDialog
      households={data.households.map(({ id, name }) => ({ id, name }))}
      defaultHouseholdId={data.activeHouseholdId}
    />
  </header>

  <section class="flex flex-col gap-4" aria-labelledby="tree-heading">
    <h2 id="tree-heading" class="text-lg font-bold">Households and users</h2>
    <HouseholdTree
      households={data.households}
      users={data.users}
      currentUserId={data.currentUserId}
      {feedback}
    />
  </section>

  <CreateHouseholdForm {feedback} />
</div>

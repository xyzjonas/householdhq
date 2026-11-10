<script lang="ts">
  import { resolve } from "$app/paths";
  import CreateHouseholdForm from "#lib/components/admin/CreateHouseholdForm.svelte";
  import CreateUserForm from "#lib/components/admin/CreateUserForm.svelte";
  import HouseholdCard from "#lib/components/admin/HouseholdCard.svelte";
  import type { AdminFeedback } from "#lib/components/admin/types.ts";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
  const feedback = $derived(form as AdminFeedback | null);
</script>

<svelte:head><title>Administration · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <header class="flex flex-col gap-2">
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
      Households are completely separate: members only ever see the data of the
      households they belong to.
    </p>
  </header>

  <section class="flex flex-col gap-4" aria-labelledby="households-heading">
    <h2 id="households-heading" class="text-lg font-bold">Households</h2>
    {#each data.households as household (household.id)}
      <HouseholdCard {household} users={data.users} {feedback} />
    {/each}
    <CreateHouseholdForm {feedback} />
  </section>

  <section class="flex flex-col gap-4" aria-labelledby="users-heading">
    <h2 id="users-heading" class="text-lg font-bold">Users</h2>
    <CreateUserForm households={data.households} {feedback} />
  </section>
</div>

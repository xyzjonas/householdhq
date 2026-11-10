<script lang="ts">
  import { resolve } from "$app/paths";
  import CreateHouseholdForm from "#lib/components/admin/CreateHouseholdForm.svelte";
  import HouseholdSection from "#lib/components/admin/HouseholdSection.svelte";
  import InviteUserDialog from "#lib/components/admin/InviteUserDialog.svelte";
  import { buildSections } from "#lib/components/admin/sections.ts";
  import type { AdminFeedback } from "#lib/components/admin/types.ts";
  import type { PageProps } from "./$types";
  import { m } from "#paraglide/messages.js";

  let { data, form }: PageProps = $props();
  const feedback = $derived(form as AdminFeedback | null);
  const sections = $derived(buildSections(data.households, data.users));
  const choices = $derived(
    data.households.map(({ id, name }) => ({ id, name })),
  );
</script>

<svelte:head
  ><title>{m.admin_page_title({ app: m.common_app_name() })}</title
  ></svelte:head
>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      {#if data.households.length > 0}
        <nav
          aria-label={m.common_breadcrumb()}
          class="text-sm text-surface-600-400"
        >
          <ol class="flex gap-2">
            <li><a class="anchor" href={resolve("/")}>{m.common_home()}</a></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">
              {m.admin_breadcrumb_current({
                households: m.admin_households_count({
                  count: data.households.length,
                }),
                users: m.admin_users_count({ count: data.users.length }),
              })}
            </li>
          </ol>
        </nav>
      {/if}
      <h1 class="text-2xl font-extrabold tracking-tight">{m.admin_title()}</h1>
      <p class="max-w-2xl text-sm text-surface-600-400">
        {m.admin_description()}
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

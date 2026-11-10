<script lang="ts">
  import { resolve } from "$app/paths";
  import House from "@lucide/svelte/icons/house";

  let {
    household,
    households,
  }: {
    household: { id: number; name: string };
    households: { id: number; name: string }[];
  } = $props();
</script>

{#if households.length > 1}
  <!-- A plain POST on purpose: a full reload drops everything the previous
       household's pages had in memory. -->
  <form
    method="POST"
    action={resolve("/household/switch")}
    class="flex items-center gap-2"
  >
    <label class="flex min-w-0 items-center gap-2 text-sm">
      <House size={16} aria-hidden="true" class="shrink-0" />
      <span class="sr-only">Household</span>
      <select
        class="select min-w-0 py-1"
        name="householdId"
        value={household.id}
        onchange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {#each households as option (option.id)}
          <option value={option.id}>{option.name}</option>
        {/each}
      </select>
    </label>
    <noscript>
      <button type="submit" class="btn preset-tonal btn-sm">Switch</button>
    </noscript>
  </form>
{:else}
  <p class="flex min-w-0 items-center gap-2 text-sm opacity-70">
    <House size={16} aria-hidden="true" class="shrink-0" />
    <span class="truncate" title={household.name}>{household.name}</span>
  </p>
{/if}

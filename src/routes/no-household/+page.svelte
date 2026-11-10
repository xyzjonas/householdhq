<script lang="ts">
  import { m } from "#paraglide/messages.js";
</script>

<svelte:head><title>{m.household_none_title()}</title></svelte:head>

<section
  class="mx-auto flex max-w-md flex-col gap-3 card bg-surface-50-950 p-6"
>
  <h1 class="text-2xl font-extrabold tracking-tight">
    {m.household_none_heading()}
  </h1>
  <p class="text-surface-600-400">{m.household_none_description()}</p>
</section>

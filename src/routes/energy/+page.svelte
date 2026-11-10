<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import Gauge from "@lucide/svelte/icons/gauge";
  import MeterDialog from "#lib/components/energy/MeterDialog.svelte";
  import MeterRow from "#lib/components/energy/MeterRow.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<svelte:head
  ><title>{m.energy_page_title({ app: m.common_app_name() })}</title
  ></svelte:head
>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <nav
        aria-label={m.energy_breadcrumb()}
        class="text-sm text-surface-600-400"
      >
        <ol class="flex gap-2">
          <li><a class="anchor" href={resolve("/")}>{m.energy_home()}</a></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">
            {m.energy_breadcrumb_current({ count: data.meters.length })}
          </li>
        </ol>
      </nav>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {m.energy_heading()}
      </h1>
    </div>
    <MeterDialog message={form?.message} />
  </header>

  <ul
    aria-label={m.energy_list_label()}
    class="flex flex-col overflow-hidden card border border-surface-200-800"
  >
    {#each data.meters as meter (meter.id)}
      <MeterRow {meter} />
    {:else}
      <li class="flex flex-col items-center gap-2 p-10 text-center">
        <Gauge size={32} class="opacity-40" aria-hidden="true" />
        <h2 class="text-lg font-bold">{m.energy_empty_title()}</h2>
        <p class="text-sm text-surface-600-400">
          {m.energy_empty_text()}
        </p>
      </li>
    {/each}
  </ul>
</div>

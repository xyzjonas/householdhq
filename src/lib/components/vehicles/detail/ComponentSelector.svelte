<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { untrack } from "svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import { readableTextOn } from "#lib/color.ts";
  import { createComponent } from "#lib/vehicles-client.ts";
  import type { VehicleComponent } from "#lib/server/core/types.ts";

  let {
    components,
    selected = [],
  }: {
    components: VehicleComponent[];
    /** Ids of the components the service starts with. */
    selected?: number[];
  } = $props();

  // Components added here appear without a reload; the page data catches up
  // the next time it refreshes.
  let available = $state(untrack(() => [...components]));
  let chosen = $state(untrack(() => [...selected]));

  let creating = $state(false);
  let name = $state("");
  let color = $state("#6b7280");
  let saving = $state(false);
  let message = $state("");

  async function add() {
    if (!name.trim() || saving) return;
    saving = true;
    message = "";
    try {
      const created = await createComponent({ name: name.trim(), color });
      available = [...available, created].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      chosen = [...chosen, created.id];
      creating = false;
      name = "";
    } catch (e) {
      message =
        e instanceof Error ? e.message : m.vehicles_error_add_component_short();
    } finally {
      saving = false;
    }
  }
</script>

<fieldset class="flex flex-col gap-2">
  <legend class="label-text">{m.vehicles_components_legend()}</legend>
  <div class="flex flex-wrap gap-1.5">
    {#each available as c (c.id)}
      <label
        class="cursor-pointer rounded-full border border-surface-300-700 bg-surface-100-900 px-3 py-1 text-xs font-semibold opacity-70 transition-opacity has-checked:opacity-100 has-checked:ring-2 has-checked:ring-offset-1 has-focus-visible:outline-2"
        style:background-color={c.color}
        style:border-color={c.color}
        style:color={c.color ? readableTextOn(c.color) : undefined}
      >
        <input
          type="checkbox"
          class="sr-only"
          name="componentIds"
          value={c.id}
          bind:group={chosen}
        />
        {c.name}
      </label>
    {/each}
    {#if !creating}
      <button
        type="button"
        class="btn rounded-full border border-dashed border-surface-400-600 px-3 py-1 text-xs btn-sm"
        onclick={() => (creating = true)}
      >
        <Plus size={14} aria-hidden="true" />
        <span>{m.vehicles_components_new()}</span>
      </button>
    {/if}
  </div>

  {#if creating}
    <!-- Not a form: it sits inside the service form. -->
    <div
      class="flex flex-wrap items-end gap-2 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3"
    >
      <label class="label min-w-36 flex-1">
        <span class="label-text">{m.vehicles_components_name()}</span>
        <input
          class="input"
          type="text"
          bind:value={name}
          placeholder={m.vehicles_components_name_placeholder()}
          autocomplete="off"
          onkeydown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            } else if (e.key === "Escape") {
              e.stopPropagation();
              creating = false;
            }
          }}
        />
      </label>
      <label class="label">
        <span class="label-text">{m.vehicles_components_colour()}</span>
        <input class="input h-10 w-14 p-1" type="color" bind:value={color} />
      </label>
      <button
        type="button"
        class="btn preset-filled-surface-950-50"
        disabled={saving || !name.trim()}
        onclick={add}
      >
        {m.common_add()}
      </button>
      <button
        type="button"
        class="btn preset-tonal"
        onclick={() => (creating = false)}
      >
        {m.common_cancel()}
      </button>
      {#if message}
        <p role="alert" class="w-full text-sm text-error-600-400">{message}</p>
      {/if}
    </div>
  {/if}
</fieldset>

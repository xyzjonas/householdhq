<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { vehicleIcon, vehicleIconOptions } from "#lib/vehicle-icons.ts";

  let {
    value = null,
    color = null,
  }: {
    value?: string | null;
    color?: string | null;
  } = $props();

  // Icons from the previous version (brand logos) are not on offer any more,
  // but a vehicle that has one must not lose it by being edited.
  const current = $derived(
    value && !vehicleIconOptions.some((o) => o.key === value) ? value : null,
  );
  const options = $derived([
    {
      key: "",
      label: () => m.vehicles_field_icon_default(),
      icon: vehicleIcon(null),
    },
    ...(current
      ? [
          {
            key: current,
            label: () => m.vehicles_field_icon_current(),
            icon: vehicleIcon(current),
          },
        ]
      : []),
    ...vehicleIconOptions,
  ]);
</script>

<fieldset class="flex flex-col gap-2">
  <legend class="label-text">{m.vehicles_field_icon()}</legend>
  <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
    {#each options as option (option.key)}
      <label
        class="grid aspect-square cursor-pointer place-items-center rounded-lg border border-surface-200-800 bg-surface-100-900/70 text-surface-600-400 transition-colors hover:border-surface-400-600 has-checked:border-(--vehicle) has-checked:bg-(--vehicle)/15 has-checked:text-(--vehicle) has-focus-visible:ring-2 has-focus-visible:ring-primary-500"
        style="--vehicle: {color ?? '#4f46e5'}"
        title={option.label()}
      >
        <input
          type="radio"
          name="icon"
          value={option.key}
          checked={(value ?? "") === option.key}
          class="sr-only"
        />
        <option.icon size={24} aria-hidden="true" />
        <span class="sr-only">{option.label()}</span>
      </label>
    {/each}
  </div>
</fieldset>

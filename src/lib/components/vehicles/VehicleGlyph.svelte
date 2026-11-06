<script lang="ts">
  import { fallbackVehicleColor, vehicleIcon } from "#lib/vehicle-icons.ts";

  let {
    icon = null,
    color = null,
    large = false,
  }: {
    icon?: string | null;
    color?: string | null;
    /** 64px tile instead of the default 48px one. */
    large?: boolean;
  } = $props();

  const Icon = $derived(vehicleIcon(icon));
</script>

<span
  class="glyph grid shrink-0 place-items-center rounded-2xl {large
    ? 'size-16'
    : 'size-12'}"
  style="--vehicle: {color ?? fallbackVehicleColor}"
  aria-hidden="true"
>
  <Icon size={large ? 32 : 24} />
</span>

<style scoped>
  .glyph {
    background-color: color-mix(in srgb, var(--vehicle) 15%, transparent);
    color: var(--vehicle);
  }
</style>

<script lang="ts">
  import { meterFallbackColor, meterIcon } from "#lib/meter-icons.ts";

  let {
    icon = null,
    color = null,
    large = false,
  }: {
    icon?: string | null;
    color?: string | null;
    /** 48px tile instead of the default 36px one. */
    large?: boolean;
  } = $props();

  const Icon = $derived(meterIcon(icon));
</script>

<span
  class="glyph grid shrink-0 place-items-center {large
    ? 'size-12 rounded-2xl'
    : 'size-9 rounded-xl'}"
  style="--meter: {color ?? meterFallbackColor}"
  aria-hidden="true"
>
  <Icon size={large ? 24 : 18} />
</span>

<style scoped>
  .glyph {
    background-color: color-mix(in srgb, var(--meter) 15%, transparent);
    color: var(--meter);
  }
</style>

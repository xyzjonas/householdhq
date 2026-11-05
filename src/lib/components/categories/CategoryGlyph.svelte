<script lang="ts">
  import {
    categoryIcon,
    fallbackColor,
  } from "../transaction-wizard/category-icons";

  let {
    icon = null,
    color = null,
    compact = false,
  }: {
    icon?: string | null;
    color?: string | null;
    /** 28px tile instead of the default 36px one. */
    compact?: boolean;
  } = $props();

  const Icon = $derived(categoryIcon(icon));
</script>

<span
  class="glyph grid shrink-0 place-items-center {compact
    ? 'size-7 rounded-lg'
    : 'size-9 rounded-xl'}"
  style="--cat: {color ?? fallbackColor}"
  aria-hidden="true"
>
  <Icon size={compact ? 14 : 18} />
</span>

<style scoped>
  .glyph {
    background-color: color-mix(in srgb, var(--cat) 15%, white);
    color: var(--cat);
  }
</style>

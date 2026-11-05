<script lang="ts">
  import {
    categoryIcon,
    fallbackColor,
  } from "../transaction-wizard/category-icons";

  let {
    icon = null,
    color = null,
  }: { icon?: string | null; color?: string | null } = $props();

  const Icon = $derived(categoryIcon(icon));
</script>

<span
  class="glyph grid size-9 shrink-0 place-items-center rounded-xl"
  style="--cat: {color ?? fallbackColor}"
  aria-hidden="true"
>
  <Icon size={18} />
</span>

<style scoped>
  .glyph {
    background-color: color-mix(in srgb, var(--cat) 15%, white);
    color: var(--cat);
  }
</style>

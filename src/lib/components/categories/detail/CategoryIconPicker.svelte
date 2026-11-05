<script lang="ts">
  import {
    categoryIcon,
    iconNames,
  } from "../../transaction-wizard/category-icons";

  let {
    value,
    onsave,
  }: {
    value: string | null;
    onsave: (icon: string | null) => void;
  } = $props();

  const Current = $derived(categoryIcon(value));
</script>

<label
  class="flex items-center justify-between gap-3 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
>
  <span class="flex min-w-0 flex-col gap-1">
    <span class="text-xs font-bold tracking-wider uppercase opacity-60">
      Icon
    </span>
    <span class="flex items-center gap-2 text-base font-bold">
      <Current size={16} aria-hidden="true" />
      {value ?? "Default"}
    </span>
  </span>
  <select
    class="select w-auto"
    aria-label="Icon"
    value={value?.toLowerCase() ?? ""}
    onchange={(e) => onsave(e.currentTarget.value || null)}
  >
    <option value="">Default</option>
    {#each iconNames as name (name)}
      <option value={name}>{name}</option>
    {/each}
  </select>
</label>

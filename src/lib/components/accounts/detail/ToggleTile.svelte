<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte";

  let {
    label,
    description,
    checked,
    onchange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onchange: (checked: boolean) => void;
  } = $props();
</script>

<Switch
  {checked}
  onCheckedChange={(e) => onchange(e.checked)}
  class="flex items-center justify-between gap-4 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
>
  <span class="flex min-w-0 flex-col">
    <Switch.Label class="text-xs font-bold tracking-wider uppercase">
      {label}
    </Switch.Label>
    <span class="text-xs opacity-60">{description}</span>
  </span>
  <Switch.Control class="shrink-0">
    <Switch.Thumb />
  </Switch.Control>
  <Switch.HiddenInput />
</Switch>

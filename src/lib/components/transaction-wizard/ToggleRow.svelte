<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte";

  let {
    name,
    label,
    description,
    checked = $bindable(),
  }: {
    name: string;
    label: string;
    description: string;
    checked: boolean;
  } = $props();
</script>

<li class="border-b border-surface-200-800 py-3 last:border-b-0">
  <Switch
    {name}
    {checked}
    onCheckedChange={(e) => (checked = e.checked)}
    class="flex items-center justify-between gap-4"
  >
    <span class="flex flex-col">
      <Switch.Label class="text-sm font-semibold text-surface-950-50">
        {label}
      </Switch.Label>
      <span class="text-xs text-surface-600-400">{description}</span>
    </span>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.HiddenInput />
  </Switch>
</li>

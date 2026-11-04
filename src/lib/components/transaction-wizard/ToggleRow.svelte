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

<li class="border-b border-slate-100 py-3 last:border-b-0">
  <Switch
    {name}
    {checked}
    onCheckedChange={(e) => (checked = e.checked)}
    class="flex items-center justify-between gap-4"
  >
    <span class="flex flex-col">
      <Switch.Label class="text-sm font-semibold text-slate-800">
        {label}
      </Switch.Label>
      <span class="text-xs text-slate-500">{description}</span>
    </span>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.HiddenInput />
  </Switch>
</li>

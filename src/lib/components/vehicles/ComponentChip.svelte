<script lang="ts">
  import { readableTextOn } from "#lib/color.ts";

  let {
    name,
    color = null,
  }: {
    name: string;
    color?: string | null;
  } = $props();
</script>

<span
  class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap {color
    ? ''
    : 'border-surface-300-700 bg-surface-100-900'}"
  style:background-color={color}
  style:border-color={color}
  style:color={color ? readableTextOn(color) : undefined}
>
  {name}
</span>

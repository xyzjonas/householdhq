<script lang="ts">
  import { formatDate, formatMoney } from "#lib/format.ts";
  import CheckpointBadge from "./CheckpointBadge.svelte";

  let { checkpoint }: { checkpoint: { created: Date; amount: number } } =
    $props();
</script>

<tr class="border-b border-surface-100-900 last:border-0">
  <td class="py-3 pr-4 text-xs font-medium whitespace-nowrap">
    <time datetime={checkpoint.created.toISOString()}>
      {formatDate(checkpoint.created)}
    </time>
  </td>
  <td class="py-3 pr-4">
    <p class="text-sm font-bold">Checkpoint</p>
    <p class="text-xs text-surface-500">Balance at this point</p>
  </td>
  <td class="py-3 pr-4"></td>
  <td class="py-3 text-right text-sm font-bold whitespace-nowrap tabular-nums">
    {formatMoney(checkpoint.amount)}
  </td>
  <td class="py-3 pl-4"><CheckpointBadge /></td>
  <td class="py-3"></td>
</tr>

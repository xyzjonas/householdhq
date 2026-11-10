<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { formatDate, formatMoney } from "#lib/format.ts";
  import CheckpointBadge from "./CheckpointBadge.svelte";

  import Trash2 from "@lucide/svelte/icons/trash-2";

  let {
    checkpoint,
    ondelete,
  }: {
    checkpoint: { created: Date; amount: number };
    /** Shows a delete button when provided. */
    ondelete?: () => void;
  } = $props();
</script>

<tr class="border-b border-surface-100-900 last:border-0">
  <td class="py-3 pr-4 text-xs font-medium whitespace-nowrap">
    <time datetime={checkpoint.created.toISOString()}>
      {formatDate(checkpoint.created)}
    </time>
  </td>
  <td class="py-3 pr-4">
    <p class="text-sm font-bold">{m.ledger_checkpoint()}</p>
    <p class="text-xs text-surface-500">{m.ledger_checkpoint_balance_at()}</p>
  </td>
  <td class="py-3 pr-4"></td>
  <td class="py-3 text-right text-sm font-bold whitespace-nowrap tabular-nums">
    {formatMoney(checkpoint.amount)}
  </td>
  <td class="py-3 pl-4"><CheckpointBadge /></td>
  <td class="py-3 text-right whitespace-nowrap">
    {#if ondelete}
      <button
        type="button"
        class="btn-icon btn-icon-sm hover:preset-tonal-error"
        aria-label={m.ledger_checkpoint_delete_label({
          amount: formatMoney(checkpoint.amount),
        })}
        onclick={ondelete}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    {/if}
  </td>
</tr>

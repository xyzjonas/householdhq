<script lang="ts">
  import { m } from "#paraglide/messages.js";
  let { entry }: { entry: { cancelled: boolean; confirmed: boolean } } =
    $props();
</script>

<span
  class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold {entry.cancelled
    ? 'bg-red-50 text-red-700'
    : entry.confirmed
      ? 'bg-slate-100 text-slate-700'
      : 'bg-amber-50 text-amber-700'}"
>
  {entry.cancelled
    ? m.ledger_status_cancelled()
    : entry.confirmed
      ? m.ledger_status_completed()
      : m.ledger_status_pending()}
</span>

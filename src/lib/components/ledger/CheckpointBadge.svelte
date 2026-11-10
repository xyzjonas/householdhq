<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import CircleCheck from "@lucide/svelte/icons/circle-check";
</script>

<span
  class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700"
>
  <CircleCheck size={12} aria-hidden="true" />
  {m.ledger_checkpoint()}
</span>

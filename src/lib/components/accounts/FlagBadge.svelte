<script lang="ts">
  import { m } from "#paraglide/messages.js";
  let {
    label,
    on,
    tone,
  }: { label: string; on: boolean; tone: "emerald" | "blue" } = $props();

  const onClass = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
  };
</script>

<span
  class="rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase {on
    ? onClass[tone]
    : 'border-slate-100 bg-slate-50 text-slate-600'}"
>
  {m.accounts_flag_state({
    label,
    state: on ? m.common_yes() : m.common_no(),
  })}
</span>

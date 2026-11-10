<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import Minus from "@lucide/svelte/icons/minus";
  import Plus from "@lucide/svelte/icons/plus";

  let {
    value,
    min = 1,
    onsave,
  }: {
    value: number;
    min?: number;
    onsave: (value: number) => Promise<void>;
  } = $props();

  // Shown immediately; saved once the clicking pauses.
  let shown = $state<number | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const display = $derived(shown ?? value);

  function step(delta: number) {
    shown = Math.max(min, display + delta);
    clearTimeout(timer);
    timer = setTimeout(commit, 400);
  }

  async function commit() {
    const next = shown;
    if (next === null || next === value) {
      shown = null;
      return;
    }
    try {
      await onsave(next);
    } catch {
      // The parent rolled back and shows the error.
    } finally {
      shown = null;
    }
  }
</script>

<div
  role="group"
  aria-label={m.accounts_stepper_group()}
  class="inline-flex items-center gap-1 rounded-base border border-surface-200-800 bg-surface-100-900/70 p-1"
>
  <button
    type="button"
    class="btn-icon preset-tonal btn-icon-sm"
    aria-label={m.accounts_stepper_up()}
    disabled={display <= min}
    onclick={() => step(-1)}
  >
    <Minus size={16} aria-hidden="true" />
  </button>
  <output
    class="min-w-12 px-2 text-center text-lg font-extrabold tabular-nums"
    aria-live="polite"
    aria-label={m.accounts_stepper_position()}
  >
    {display}
  </output>
  <button
    type="button"
    class="btn-icon preset-tonal btn-icon-sm"
    aria-label={m.accounts_stepper_down()}
    onclick={() => step(1)}
  >
    <Plus size={16} aria-hidden="true" />
  </button>
</div>

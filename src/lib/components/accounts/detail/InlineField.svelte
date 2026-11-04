<script lang="ts">
  import { tick } from "svelte";
  import Check from "@lucide/svelte/icons/check";
  import Pencil from "@lucide/svelte/icons/pencil";
  import X from "@lucide/svelte/icons/x";

  let {
    label,
    value,
    type = "text",
    hint,
    onsave,
  }: {
    label: string;
    value: string | number;
    type?: "text" | "number";
    hint?: string;
    onsave: (value: string) => Promise<void>;
  } = $props();

  let editing = $state(false);
  let draft = $state("");
  let saving = $state(false);
  let input = $state<HTMLInputElement>();

  async function start() {
    draft = String(value);
    editing = true;
    await tick();
    input?.select();
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (draft.trim() === String(value)) {
      editing = false;
      return;
    }
    saving = true;
    try {
      await onsave(draft.trim());
      editing = false;
    } catch {
      // The parent shows the error; keep the field open for another try.
    } finally {
      saving = false;
    }
  }
</script>

<div
  class="flex items-center justify-between gap-3 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
>
  {#if editing}
    <form class="flex w-full items-end gap-2" onsubmit={submit}>
      <label class="flex min-w-0 flex-1 flex-col gap-1">
        <span class="text-xs font-bold tracking-wider uppercase opacity-60">
          {label}
        </span>
        <input
          bind:this={input}
          bind:value={draft}
          class="input"
          {type}
          required
          step={type === "number" ? 1 : undefined}
          disabled={saving}
          onkeydown={(e) => e.key === "Escape" && (editing = false)}
        />
      </label>
      <button
        type="submit"
        class="btn-icon preset-filled-surface-950-50"
        aria-label="Save {label.toLowerCase()}"
        disabled={saving}
      >
        <Check size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        class="btn-icon preset-tonal"
        aria-label="Cancel editing {label.toLowerCase()}"
        onclick={() => (editing = false)}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </form>
  {:else}
    <div class="min-w-0">
      <p class="text-xs font-bold tracking-wider uppercase opacity-60">
        {label}
      </p>
      <p class="truncate text-base font-bold">
        {value}
        {#if hint}<span class="text-xs font-medium opacity-60">{hint}</span
          >{/if}
      </p>
    </div>
    <button
      type="button"
      class="btn-icon preset-tonal btn-icon-sm"
      aria-label="Edit {label.toLowerCase()}"
      onclick={start}
    >
      <Pencil size={16} aria-hidden="true" />
    </button>
  {/if}
</div>

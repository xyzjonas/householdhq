<script lang="ts">
  import Delete from "@lucide/svelte/icons/delete";
  import type { Key } from "./calculator";

  let { onpress }: { onpress: (key: Key) => void } = $props();

  const rows: (Key | "back")[][] = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "back"],
    ["+", "-", "="],
  ];

  const LONG_PRESS_MS = 500;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let longPressed = false;

  function startBackspace() {
    longPressed = false;
    timer = setTimeout(() => {
      longPressed = true;
      onpress("clear");
    }, LONG_PRESS_MS);
  }

  function cancelBackspace() {
    clearTimeout(timer);
  }

  function endBackspace() {
    cancelBackspace();
    if (!longPressed) onpress("back");
    longPressed = false;
  }

  const label = (k: Key) => (k === "-" ? "−" : k);
</script>

<div
  class="keypad grid grid-cols-3 gap-3 rounded-2xl border border-surface-200-800 bg-surface-100-900 p-4"
  role="group"
  aria-label="Calculator keypad"
>
  {#each rows as row (row.join())}
    {#each row as key (key)}
      {#if key === "back"}
        <!-- Pointer events give long-press → clear; the keyboard fallback is a plain click. -->
        <button
          type="button"
          class="key"
          aria-label="Backspace (hold to clear)"
          onpointerdown={startBackspace}
          onpointerup={endBackspace}
          onpointerleave={cancelBackspace}
          onpointercancel={cancelBackspace}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onpress("back");
            }
          }}
          oncontextmenu={(e) => e.preventDefault()}
        >
          <Delete size={22} aria-hidden="true" />
        </button>
      {:else}
        <button
          type="button"
          class="key {'+-='.includes(key) ? 'operator' : ''}"
          aria-label={key === "-" ? "Minus" : key === "+" ? "Plus" : undefined}
          onclick={() => onpress(key)}
        >
          {label(key)}
        </button>
      {/if}
    {/each}
  {/each}
</div>

<style scoped>
  .key {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: 0.875rem;
    border-radius: 0.75rem;
    border: 1px solid light-dark(#e2e8f0, #334155);
    background: light-dark(#fff, #1e293b);
    color: light-dark(#1e293b, #f1f5f9);
    font-size: 1.25rem;
    font-weight: 600;
    box-shadow: 0 2px 8px -2px rgb(15 23 42 / 0.05);
    touch-action: manipulation;
    user-select: none;
    transition:
      transform 80ms,
      background-color 80ms;
  }
  .key:active {
    transform: scale(0.95);
    background: light-dark(#e2e8f0, #475569);
  }
  .key:focus-visible {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
  .operator {
    color: light-dark(#059669, #34d399);
  }
  @media (prefers-reduced-motion: reduce) {
    .key {
      transition: none;
    }
  }
</style>

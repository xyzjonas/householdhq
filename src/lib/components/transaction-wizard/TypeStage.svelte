<script lang="ts">
  import { transactionTypes, type TransactionType } from "./types";

  let {
    value = $bindable(),
    onchange,
  }: {
    value: TransactionType;
    onchange?: (value: TransactionType) => void;
  } = $props();
</script>

<fieldset class="flex flex-col gap-3">
  <legend class="sr-only">Type of transaction</legend>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {#each transactionTypes as t (t.value)}
      <label
        class="type-pill flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition-colors duration-150 active:scale-95 {value ===
        t.value
          ? t.active
          : 'border-surface-200-800 bg-surface-50-950 text-surface-950-50'}"
      >
        <input
          class="sr-only"
          type="radio"
          name="type"
          value={t.value}
          bind:group={value}
          onchange={() => onchange?.(t.value)}
        />
        <span class="flex items-center gap-2 text-base font-bold">
          <span class="size-2.5 rounded-full {t.dot}" aria-hidden="true"></span>
          {t.label}
        </span>
        <span class="text-xs font-medium opacity-70">{t.hint}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style scoped>
  .type-pill {
    box-shadow: 0 2px 8px -2px rgb(15 23 42 / 0.05);
  }
  .type-pill:has(input:focus-visible) {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    .type-pill {
      transition: none;
    }
  }
</style>

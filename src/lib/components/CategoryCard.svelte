<script lang="ts">
  import Check from "@lucide/svelte/icons/check";
  import { formatMoney } from "#lib/format.ts";
  import { m } from "#paraglide/messages.js";
  import {
    categoryIcon,
    fallbackColor,
  } from "./transaction-wizard/category-icons";

  let {
    id,
    name,
    subtitle,
    icon = null,
    color = null,
    selected = false,
    onselect,
    inputName = "categoryId",
    disabled = false,
    showBudget = false,
    spentAmount,
    capAmount,
    budgetPercentage,
  }: {
    id: number;
    name: string;
    subtitle?: string | null;
    /** Icon name as stored in the DB; unknown or missing names use a fallback. */
    icon?: string | null;
    /** Accent colour (any CSS colour); falls back to slate when missing. */
    color?: string | null;
    selected?: boolean;
    onselect?: (id: number) => void;
    /** Name of the underlying radio input, shared by the cards of one picker. */
    inputName?: string;
    disabled?: boolean;
    /** Render spend / cap figures and a progress bar. */
    showBudget?: boolean;
    spentAmount?: number;
    capAmount?: number;
    /** Overrides the percentage derived from spentAmount / capAmount. */
    budgetPercentage?: number;
  } = $props();

  const Icon = $derived(categoryIcon(icon));

  const percentage = $derived(
    budgetPercentage ??
      (spentAmount !== undefined && capAmount
        ? Math.round((spentAmount / capAmount) * 100)
        : undefined),
  );

  /** <80% normal, 80–99% warning, >=100% exceeded. */
  const status = $derived(
    percentage === undefined || percentage < 80
      ? "ok"
      : percentage < 100
        ? "warn"
        : "over",
  );
</script>

<label
  class="cat-card relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-3.5 transition-all duration-150 select-none active:scale-[0.98]"
  class:selected
  class:disabled
  style="--cat: {color ?? fallbackColor}"
>
  <input
    class="sr-only"
    type="radio"
    name={inputName}
    value={id}
    checked={selected}
    {disabled}
    onchange={() => onselect?.(id)}
  />

  <span class="flex items-center justify-between">
    <span class="icon grid size-9 place-items-center rounded-xl">
      <Icon size={18} aria-hidden="true" />
    </span>
    <span class="flex items-center gap-1.5">
      {#if selected}
        <span
          class="grid size-5 place-items-center rounded-full bg-surface-950-50 text-surface-50-950"
        >
          <Check size={12} aria-hidden="true" />
        </span>
      {/if}
      {#if showBudget && percentage !== undefined}
        <span class="pct text-xs font-bold {status}">{percentage}%</span>
      {/if}
    </span>
  </span>

  <span class="min-w-0">
    <span
      class="block truncate text-sm font-bold tracking-tight text-surface-950-50"
    >
      {name}
    </span>
    {#if subtitle}
      <span class="block truncate text-[11px] text-surface-600-400"
        >{subtitle}</span
      >
    {/if}
  </span>

  {#if showBudget}
    <span class="flex flex-col gap-1">
      {#if spentAmount !== undefined && capAmount}
        <span
          class="flex items-center justify-between text-[11px] font-medium text-surface-600-400 tabular-nums"
        >
          <span>{formatMoney(spentAmount)}</span>
          <span class="text-surface-500">/ {formatMoney(capAmount)}</span>
        </span>
      {/if}
      {#if percentage !== undefined}
        <span
          class="block h-1.5 w-full overflow-hidden rounded-full bg-surface-200-800"
          role="progressbar"
          aria-label={m.dashboard_budget_used()}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(percentage, 100)}
        >
          <span
            class="fill block h-full rounded-full transition-all duration-300 {status}"
            style="width: {Math.min(percentage, 100)}%"
          ></span>
        </span>
      {/if}
    </span>
  {/if}
</label>

<style scoped>
  .cat-card {
    background-color: light-dark(
      rgb(248 250 252 / 0.8),
      rgb(255 255 255 / 0.04)
    );
    border-color: light-dark(#e2e8f0, rgb(255 255 255 / 0.1));
  }
  .cat-card:hover:not(.selected):not(.disabled) {
    background-color: light-dark(#fff, rgb(255 255 255 / 0.08));
    border-color: light-dark(#cbd5e1, rgb(255 255 255 / 0.2));
    box-shadow: 0 2px 8px -2px rgb(15 23 42 / 0.08);
  }
  .cat-card.selected {
    background-color: light-dark(
      rgb(239 246 255 / 0.6),
      rgb(255 255 255 / 0.1)
    );
    border-color: light-dark(#0f172a, #f1f5f9);
    box-shadow: 0 2px 8px -2px rgb(15 23 42 / 0.08);
  }
  .cat-card.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cat-card:has(input:focus-visible) {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
  .icon {
    background-color: color-mix(
      in srgb,
      var(--cat) 15%,
      light-dark(white, transparent)
    );
    color: var(--cat);
  }
  .pct.ok {
    color: #64748b;
  }
  .pct.warn {
    color: #d97706;
  }
  .pct.over {
    color: #e11d48;
  }
  .fill.ok {
    background-color: #10b981;
  }
  .fill.warn {
    background-color: #f59e0b;
  }
  .fill.over {
    background-color: #f43f5e;
  }
</style>

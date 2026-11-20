<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";
  import { formatMoney } from "#lib/format.ts";

  /** Budget the example is worked out for. */
  const EXAMPLE_BUDGET = 1000;

  let {
    pct,
    currency,
    message = "",
    saved = false,
  }: {
    pct: number;
    currency: string;
    message?: string;
    saved?: boolean;
  } = $props();

  let submitting = $state(false);
  /** What the user typed; until they type, the saved value applies. */
  let typed = $state<number | null>(null);
  const value = $derived(typed ?? pct);
  const valid = $derived(Number.isInteger(value) && value >= 1 && value <= 100);
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">{m.settings_budget_alert_title()}</h2>
    <p class="text-sm text-surface-600-400">{m.settings_budget_alert_hint()}</p>
  </header>
  <form
    method="POST"
    action="?/budgetAlert"
    class="flex flex-col gap-4"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update({ reset: false });
        submitting = false;
      };
    }}
  >
    <label class="label">
      <span class="label-text">{m.settings_budget_alert_label()}</span>
      <input
        class="input"
        type="number"
        name="budgetAlertPct"
        min="1"
        max="100"
        step="1"
        required
        value={pct}
        oninput={(e) => (typed = e.currentTarget.valueAsNumber)}
        aria-describedby="budget-alert-example"
      />
    </label>
    <p id="budget-alert-example" class="text-sm text-surface-600-400">
      {#if valid}
        {m.settings_budget_alert_example({
          budget: formatMoney(EXAMPLE_BUDGET, currency),
          spent: formatMoney((EXAMPLE_BUDGET * value) / 100, currency),
        })}
      {:else}
        {m.settings_budget_alert_enter()}
      {/if}
    </p>
    {#if message}
      <p role="alert" class="text-sm text-error-600-400">{message}</p>
    {:else if saved}
      <p role="status" class="text-sm text-success-600-400">
        {m.settings_saved()}
      </p>
    {/if}
    <div class="flex justify-end">
      <button
        type="submit"
        class="btn preset-filled-surface-950-50"
        disabled={submitting}
      >
        {m.common_save_changes()}
      </button>
    </div>
  </form>
</section>

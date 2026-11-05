<script lang="ts">
  import { enhance } from "$app/forms";
  import { fiscalIntervalAt } from "#lib/fiscal-interval.ts";
  import { formatDate } from "#lib/format.ts";

  let {
    startDay,
    message = "",
    saved = false,
  }: {
    startDay: number;
    message?: string;
    saved?: boolean;
  } = $props();

  let submitting = $state(false);
  /** What the user typed; until they type, the saved day applies. */
  let typed = $state<number | null>(null);
  const day = $derived(typed ?? startDay);

  const interval = $derived(
    Number.isInteger(day) && day >= 1 && day <= 31
      ? fiscalIntervalAt(new Date(), day)
      : null,
  );
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">Fiscal interval</h2>
    <p class="text-sm text-surface-600-400">
      The period between your major incomes. The dashboard shows what is
      available to spend until the interval ends.
    </p>
  </header>
  <form
    method="POST"
    action="?/interval"
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
      <span class="label-text">Interval starts on day of month</span>
      <input
        class="input"
        type="number"
        name="fiscalIntervalStartDay"
        min="1"
        max="31"
        step="1"
        required
        value={startDay}
        oninput={(e) => (typed = e.currentTarget.valueAsNumber)}
        aria-describedby="fiscal-interval-hint"
      />
    </label>
    <p id="fiscal-interval-hint" class="text-sm text-surface-600-400">
      {#if interval}
        Current interval: {formatDate(interval.start)} – {formatDate(
          interval.end,
        )}. Use 1 for the calendar month; shorter months end on their last day.
      {:else}
        Enter a day from 1 to 31.
      {/if}
    </p>
    {#if message}
      <p role="alert" class="text-sm text-error-600-400">{message}</p>
    {:else if saved}
      <p role="status" class="text-sm text-success-600-400">Settings saved.</p>
    {/if}
    <div class="flex justify-end">
      <button
        type="submit"
        class="btn preset-filled-surface-950-50"
        disabled={submitting}
      >
        Save changes
      </button>
    </div>
  </form>
</section>

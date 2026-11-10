<script lang="ts">
  import { m } from "#paraglide/messages.js";
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
    <h2 class="text-lg font-bold">{m.settings_interval_title()}</h2>
    <p class="text-sm text-surface-600-400">
      {m.settings_interval_hint()}
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
      <span class="label-text">{m.settings_interval_label()}</span>
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
        {m.settings_interval_current({
          start: formatDate(interval.start),
          end: formatDate(interval.end),
        })}
      {:else}
        {m.settings_interval_enter_day()}
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

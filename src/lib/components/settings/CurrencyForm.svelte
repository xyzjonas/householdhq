<script lang="ts">
  import { enhance } from "$app/forms";

  let {
    currency,
    currencies,
    message = "",
    saved = false,
  }: {
    currency: string;
    currencies: string[];
    message?: string;
    saved?: boolean;
  } = $props();

  let submitting = $state(false);
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">Currency</h2>
    <p class="text-sm text-surface-600-400">
      The default currency for your household.
    </p>
  </header>
  <form
    method="POST"
    action="?/update"
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
      <span class="label-text">Default currency</span>
      <select class="select" name="currency" value={currency}>
        {#each currencies as code (code)}
          <option value={code}>{code}</option>
        {/each}
      </select>
    </label>
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

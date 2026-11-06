<script lang="ts">
  import { enhance } from "$app/forms";

  let {
    accountId,
    accounts,
    message = "",
    saved = false,
  }: {
    accountId: number | null;
    accounts: { id: number; name: string }[];
    message?: string;
    saved?: boolean;
  } = $props();

  let submitting = $state(false);
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">Default out account</h2>
    <p class="text-sm text-surface-600-400">
      The external account expenses are paid to unless you pick another one
      while recording them. Checkpoint adjustments use it too.
    </p>
  </header>
  <form
    method="POST"
    action="?/defaultOut"
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
      <span class="label-text">External account</span>
      <select class="select" name="defaultOutAccountId" value={accountId}>
        {#each accounts as a (a.id)}
          <option value={a.id}>{a.name}</option>
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
        disabled={submitting || accounts.length === 0}
      >
        Save changes
      </button>
    </div>
  </form>
</section>

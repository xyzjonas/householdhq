<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";

  let {
    categoryId,
    categories,
    message = "",
    saved = false,
  }: {
    categoryId: number | null;
    categories: { id: number; name: string }[];
    message?: string;
    saved?: boolean;
  } = $props();

  let submitting = $state(false);
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">{m.settings_manko_title()}</h2>
    <p class="text-sm text-surface-600-400">
      {m.settings_manko_hint()}
    </p>
  </header>
  <form
    method="POST"
    action="?/manko"
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
      <span class="label-text">{m.settings_manko_label()}</span>
      <select class="select" name="mankoCategoryId" value={categoryId}>
        {#each categories as c (c.id)}
          <option value={c.id}>{c.name}</option>
        {/each}
      </select>
    </label>
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

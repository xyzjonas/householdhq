<script lang="ts">
  import { enhance } from "$app/forms";
  import type { AdminFeedback } from "./types";
  import { m } from "#paraglide/messages.js";

  let { feedback }: { feedback: AdminFeedback | null } = $props();

  const mine = $derived(
    feedback?.action === "createHousehold" ? feedback : null,
  );
  let submitting = $state(false);
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">{m.admin_household_new_title()}</h2>
    <p class="text-sm text-surface-600-400">
      {m.admin_household_new_description()}
    </p>
  </header>
  <form
    method="POST"
    action="?/createHousehold"
    class="flex flex-col gap-4"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
  >
    <label class="label">
      <span class="label-text">{m.admin_household_name_label()}</span>
      <input class="input" name="name" autocomplete="off" required />
    </label>
    {#if mine?.message}
      <p role="alert" class="text-sm text-error-600-400">{mine.message}</p>
    {:else if mine?.saved}
      <p role="status" class="text-sm text-success-600-400">
        {m.admin_household_created()}
      </p>
    {/if}
    <div class="flex justify-end">
      <button
        type="submit"
        class="btn preset-filled-surface-950-50"
        disabled={submitting}
      >
        {m.admin_household_create_submit()}
      </button>
    </div>
  </form>
</section>

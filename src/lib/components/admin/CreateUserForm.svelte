<script lang="ts">
  import { enhance } from "$app/forms";
  import type { AdminFeedback } from "./types";

  let {
    households,
    feedback,
  }: {
    households: { id: number; name: string }[];
    feedback: AdminFeedback | null;
  } = $props();

  const mine = $derived(feedback?.action === "createUser" ? feedback : null);
  let submitting = $state(false);
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">New user</h2>
    <p class="text-sm text-surface-600-400">
      Creates a sign-in. Add the user to a household now or later; one household
      per user is the usual setup.
    </p>
  </header>
  <form
    method="POST"
    action="?/createUser"
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
      <span class="label-text">Email</span>
      <input
        class="input"
        name="email"
        type="email"
        autocomplete="off"
        required
        value={mine?.email ?? ""}
      />
      {#each mine?.errors?.email ?? [] as msg (msg)}
        <small class="text-error-600-400">{msg}</small>
      {/each}
    </label>
    <label class="label">
      <span class="label-text">Password</span>
      <input
        class="input"
        name="password"
        type="password"
        autocomplete="new-password"
        minlength="8"
        required
      />
      {#each mine?.errors?.password ?? [] as msg (msg)}
        <small class="text-error-600-400">{msg}</small>
      {/each}
    </label>
    <label class="label">
      <span class="label-text">Household</span>
      <select class="select" name="householdId">
        <option value="">None yet</option>
        {#each households as household (household.id)}
          <option value={household.id}>{household.name}</option>
        {/each}
      </select>
    </label>
    {#if mine?.saved}
      <p role="status" class="text-sm text-success-600-400">User created.</p>
    {/if}
    <div class="flex justify-end">
      <button
        type="submit"
        class="btn preset-filled-surface-950-50"
        disabled={submitting}
      >
        Create user
      </button>
    </div>
  </form>
</section>

<script lang="ts">
  import { enhance } from "$app/forms";
  import AuthCard from "#lib/components/AuthCard.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
  const errors = $derived<Record<string, string[] | undefined>>(
    form?.errors ?? {},
  );
</script>

<svelte:head><title>Set up · Household HQ</title></svelte:head>

<AuthCard
  title="Create admin account"
  description="Welcome! Create the first account to get started."
>
  <form method="POST" use:enhance class="flex flex-col gap-4">
    <label class="label">
      <span class="label-text">Email</span>
      <input
        class="input"
        name="email"
        type="email"
        autocomplete="username"
        required
        value={form?.email ?? ""}
      />
      {#each errors.email ?? [] as msg (msg)}
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
      {#each errors.password ?? [] as msg (msg)}
        <small class="text-error-600-400">{msg}</small>
      {/each}
    </label>
    <label class="label">
      <span class="label-text">Confirm password</span>
      <input
        class="input"
        name="confirm"
        type="password"
        autocomplete="new-password"
        required
      />
      {#each errors.confirm ?? [] as msg (msg)}
        <small class="text-error-600-400">{msg}</small>
      {/each}
    </label>
    <button type="submit" class="btn preset-filled-surface-950-50">
      Create account
    </button>
  </form>
</AuthCard>

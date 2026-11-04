<script lang="ts">
  import { enhance } from "$app/forms";
  import AuthCard from "#lib/components/AuthCard.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<svelte:head><title>Sign in · Household HQ</title></svelte:head>

<AuthCard title="Sign in">
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
    </label>
    <label class="label">
      <span class="label-text">Password</span>
      <input
        class="input"
        name="password"
        type="password"
        autocomplete="current-password"
        required
      />
    </label>
    {#if form?.message}
      <p role="alert" class="text-sm text-error-600-400">{form.message}</p>
    {/if}
    <button type="submit" class="btn preset-filled-surface-950-50">
      Sign in
    </button>
  </form>
</AuthCard>

<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import AuthCard from "#lib/components/AuthCard.svelte";
  import { decodeInvite, type InviteCredentials } from "#lib/invite.ts";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();

  // The credentials live in the URL fragment, which only the browser sees.
  let credentials = $state<InviteCredentials | null>(null);
  let checked = $state(false);

  onMount(() => {
    credentials = decodeInvite(location.hash.slice(1));
    checked = true;
  });
</script>

<svelte:head><title>Welcome · Household HQ</title></svelte:head>

{#if credentials}
  <AuthCard
    title="Welcome!"
    description="You've been invited to Household HQ as {credentials.email}. Choose a password to finish setting up your account."
  >
    <form method="POST" use:enhance class="flex flex-col gap-4">
      <input type="hidden" name="email" value={credentials.email} />
      <input type="hidden" name="current" value={credentials.password} />
      <label class="label">
        <span class="label-text">New password</span>
        <input
          class="input"
          name="password"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
        />
      </label>
      <label class="label">
        <span class="label-text">Confirm new password</span>
        <input
          class="input"
          name="confirm"
          type="password"
          autocomplete="new-password"
          required
        />
      </label>
      {#if form?.message}
        <p role="alert" class="text-sm text-error-600-400">{form.message}</p>
      {/if}
      <button type="submit" class="btn preset-filled-surface-950-50">
        Set password & sign in
      </button>
    </form>
  </AuthCard>
{:else if checked}
  <AuthCard
    title="Invalid invite link"
    description="This link is incomplete or damaged. Ask for a new invite."
  >
    <a class="btn preset-tonal" href={resolve("/login")}>Go to sign in</a>
  </AuthCard>
{/if}

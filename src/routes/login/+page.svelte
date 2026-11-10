<script lang="ts">
  import { enhance } from "$app/forms";
  import AuthCard from "#lib/components/AuthCard.svelte";
  import { m } from "#paraglide/messages.js";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<svelte:head><title>{m.auth_sign_in_title()}</title></svelte:head>

<AuthCard title={m.auth_sign_in()}>
  <form method="POST" use:enhance class="flex flex-col gap-4">
    <label class="label">
      <span class="label-text">{m.auth_email()}</span>
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
      <span class="label-text">{m.auth_password()}</span>
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
      {m.auth_sign_in()}
    </button>
  </form>
</AuthCard>

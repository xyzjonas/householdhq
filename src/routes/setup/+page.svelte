<script lang="ts">
  import { enhance } from "$app/forms";
  import AuthCard from "#lib/components/AuthCard.svelte";
  import { m } from "#paraglide/messages.js";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
  const errors = $derived<Record<string, string[] | undefined>>(
    form?.errors ?? {},
  );
</script>

<svelte:head><title>{m.auth_setup_title()}</title></svelte:head>

<AuthCard
  title={m.auth_setup_heading()}
  description={m.auth_setup_description_household()}
>
  <form method="POST" use:enhance class="flex flex-col gap-4">
    <label class="label">
      <span class="label-text">{m.auth_setup_household_name()}</span>
      <input
        class="input"
        name="household"
        autocomplete="off"
        required
        value={form?.household ?? m.auth_setup_household_default()}
      />
      {#each errors.household ?? [] as msg (msg)}
        <small class="text-error-600-400">{msg}</small>
      {/each}
    </label>
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
      {#each errors.email ?? [] as msg (msg)}
        <small class="text-error-600-400">{msg}</small>
      {/each}
    </label>
    <label class="label">
      <span class="label-text">{m.auth_password()}</span>
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
      <span class="label-text">{m.auth_confirm_password()}</span>
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
      {m.auth_create_account()}
    </button>
  </form>
</AuthCard>

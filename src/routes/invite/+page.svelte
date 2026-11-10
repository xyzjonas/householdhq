<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import AuthCard from "#lib/components/AuthCard.svelte";
  import { decodeInvite, type InviteCredentials } from "#lib/invite.ts";
  import { m } from "#paraglide/messages.js";
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

<svelte:head
  ><title>{m.invite_page_title({ app: m.common_app_name() })}</title
  ></svelte:head
>

{#if credentials}
  <AuthCard
    title={m.invite_welcome_title()}
    description={m.invite_welcome_description({
      app: m.common_app_name(),
      email: credentials.email,
    })}
  >
    <form method="POST" use:enhance class="flex flex-col gap-4">
      <input type="hidden" name="email" value={credentials.email} />
      <input type="hidden" name="current" value={credentials.password} />
      <label class="label">
        <span class="label-text">{m.invite_password_label()}</span>
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
        <span class="label-text">{m.invite_confirm_label()}</span>
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
        {m.invite_submit()}
      </button>
    </form>
  </AuthCard>
{:else if checked}
  <AuthCard
    title={m.invite_invalid_title()}
    description={m.invite_invalid_description()}
  >
    <a class="btn preset-tonal" href={resolve("/login")}
      >{m.invite_go_to_sign_in()}</a
    >
  </AuthCard>
{/if}

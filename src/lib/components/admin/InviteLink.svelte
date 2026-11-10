<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import Copy from "@lucide/svelte/icons/copy";
  import { toaster } from "#lib/toaster.ts";
  import { m } from "#paraglide/messages.js";

  let { email, token }: { email: string; token: string } = $props();

  // The token lives in the fragment, so it never reaches server logs.
  const link = $derived(`${page.url.origin}${resolve("/invite")}#${token}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toaster.success({ title: m.users_invite_link_copied() });
    } catch {
      toaster.error({ title: m.users_invite_link_copy_failed() });
    }
  }
</script>

<section class="flex flex-col gap-3" aria-label={m.users_invite_link_label()}>
  <p class="text-sm">
    {m.users_invite_link_intro({ email })}
  </p>
  <div class="flex gap-2">
    <input
      class="input min-w-0 flex-1 font-mono text-xs"
      type="text"
      readonly
      aria-label={m.users_invite_link_input_label({ email })}
      value={link}
      onfocus={(e) => e.currentTarget.select()}
    />
    <button type="button" class="btn preset-tonal" onclick={copy}>
      <Copy size={16} aria-hidden="true" />
      <span>{m.users_copy()}</span>
    </button>
  </div>
</section>

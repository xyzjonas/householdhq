<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import Copy from "@lucide/svelte/icons/copy";
  import { toaster } from "#lib/toaster.ts";

  let { email, token }: { email: string; token: string } = $props();

  // The token lives in the fragment, so it never reaches server logs.
  const link = $derived(`${page.url.origin}${resolve("/invite")}#${token}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toaster.success({ title: "Invite link copied" });
    } catch {
      toaster.error({ title: "Could not copy — select the link and copy it" });
    }
  }
</script>

<section class="flex flex-col gap-3" aria-label="Invite link">
  <p class="text-sm">
    Send this link to <strong>{email}</strong>. It contains their one-time
    password and is shown only now.
  </p>
  <div class="flex gap-2">
    <input
      class="input min-w-0 flex-1 font-mono text-xs"
      type="text"
      readonly
      aria-label="Invite link for {email}"
      value={link}
      onfocus={(e) => e.currentTarget.select()}
    />
    <button type="button" class="btn preset-tonal" onclick={copy}>
      <Copy size={16} aria-hidden="true" />
      <span>Copy</span>
    </button>
  </div>
</section>

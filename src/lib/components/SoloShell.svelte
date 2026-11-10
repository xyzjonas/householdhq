<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Snippet } from "svelte";
  import LogOut from "@lucide/svelte/icons/log-out";
  import { m } from "#paraglide/messages.js";

  let { user, children }: { user: { email: string }; children: Snippet } =
    $props();
</script>

<header
  class="flex items-center gap-3 border-b border-surface-200-800 bg-surface-50-950 px-4 py-3 lg:px-8"
>
  <span class="text-lg font-extrabold tracking-tight"
    >{m.common_app_name()}</span
  >
  <p class="ml-auto min-w-0 truncate text-sm opacity-70" title={user.email}>
    {user.email}
  </p>
  <form method="POST" action={resolve("/logout")}>
    <button
      type="submit"
      class="btn-icon preset-tonal"
      aria-label={m.shell_sign_out()}
    >
      <LogOut size={16} aria-hidden="true" />
    </button>
  </form>
</header>
<main class="p-4 lg:p-8">{@render children()}</main>

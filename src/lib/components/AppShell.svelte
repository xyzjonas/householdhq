<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Snippet } from "svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import LogOut from "@lucide/svelte/icons/log-out";
  import Search from "@lucide/svelte/icons/search";
  import type { HouseholdSummary } from "#lib/household.ts";
  import HouseholdTitle from "./HouseholdTitle.svelte";
  import { m } from "#paraglide/messages.js";
  import NavItems from "./NavItems.svelte";

  let {
    user,
    household,
    households,
    children,
  }: {
    user: { email: string };
    household: HouseholdSummary;
    households: HouseholdSummary[];
    children: Snippet;
  } = $props();
</script>

<div class="min-h-screen lg:grid lg:grid-cols-[17.5rem_1fr]">
  <aside
    class="sticky top-0 hidden h-screen flex-col gap-8 border-r border-surface-200-800 bg-surface-50-950 p-6 lg:flex"
  >
    <HouseholdTitle {household} {households} />
    <nav aria-label={m.nav_main_label()}>
      <NavItems layout="sidebar" />
    </nav>
    <div class="mt-auto flex flex-col gap-2 text-sm">
      <p class="truncate opacity-70" title={user.email}>{user.email}</p>
      <form method="POST" action={resolve("/logout")}>
        <button type="submit" class="btn w-full preset-tonal">
          <LogOut size={16} aria-hidden="true" />
          <span>{m.shell_sign_out()}</span>
        </button>
      </form>
    </div>
  </aside>

  <div class="flex min-w-0 flex-col">
    <header
      class="sticky top-0 z-10 flex items-center gap-3 border-b border-surface-200-800 bg-surface-50-950/90 px-4 py-3 backdrop-blur lg:px-8"
    >
      <div class="min-w-0 flex-1 sm:max-w-64 sm:flex-none lg:hidden">
        <HouseholdTitle {household} {households} />
      </div>
      <form
        role="search"
        class="ml-auto hidden max-w-sm flex-1 sm:block lg:ml-0"
      >
        <div class="field-group grid-cols-[auto_1fr]">
          <span class="label preset-tonal">
            <Search size={16} aria-hidden="true" />
          </span>
          <input
            class="input"
            type="search"
            name="q"
            placeholder={m.shell_search_placeholder()}
            aria-label={m.shell_search_label()}
          />
        </div>
      </form>
      <a
        href={resolve("/transactions/new")}
        class="ml-auto btn preset-filled-surface-950-50 sm:ml-0"
      >
        <Plus size={16} aria-hidden="true" />
        <span class="max-sm:sr-only">{m.shell_add_record()}</span>
      </a>
      <form method="POST" action={resolve("/logout")} class="lg:hidden">
        <button
          type="submit"
          class="btn-icon preset-tonal"
          aria-label={m.shell_sign_out()}
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </form>
    </header>

    <main class="flex-1 p-4 pb-24 lg:p-8 lg:pb-8">
      {@render children()}
    </main>
  </div>

  <nav
    aria-label={m.nav_mobile_label()}
    class="fixed inset-x-0 bottom-0 z-10 border-t border-surface-200-800 bg-surface-50-950 lg:hidden"
  >
    <NavItems layout="bar" />
  </nav>
</div>

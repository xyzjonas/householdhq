<script lang="ts">
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Search from "@lucide/svelte/icons/search";
  import X from "@lucide/svelte/icons/x";
  import { m } from "#paraglide/messages.js";
  import {
    iconGroupLabel,
    iconGroups,
    searchIcons,
    type CatalogIcon,
  } from "#lib/category-icon-catalog.ts";
  import { categoryIcon } from "../../transaction-wizard/category-icons";

  let {
    value,
    onsave,
  }: {
    value: string | null;
    onsave: (icon: string | null) => Promise<void>;
  } = $props();

  let open = $state(false);
  let query = $state("");
  let saving = $state(false);

  const Current = $derived(categoryIcon(value));
  const results = $derived(searchIcons(query));
  const groups = $derived(
    iconGroups
      .map((group) => ({
        group,
        icons: results.filter((i) => i.group === group),
      }))
      .filter((g) => g.icons.length),
  );

  async function choose(icon: CatalogIcon | null) {
    if ((icon?.name ?? null) === value) {
      open = false;
      return;
    }
    saving = true;
    try {
      await onsave(icon?.name ?? null);
      open = false;
    } catch {
      // The parent shows the error; keep the dialog open for another try.
    } finally {
      saving = false;
    }
  }
</script>

<div
  class="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
>
  <div class="min-w-0">
    <p class="text-xs font-bold tracking-wider uppercase opacity-60">
      {m.categories_props_icon()}
    </p>
    <p class="flex items-center gap-2 text-base font-bold">
      <Current size={16} aria-hidden="true" />
      <span class="truncate">{value ?? m.categories_props_icon_default()}</span>
    </p>
  </div>
  <button
    type="button"
    class="btn shrink-0 rounded-full preset-tonal text-xs"
    onclick={() => {
      query = "";
      open = true;
    }}
  >
    {m.categories_props_change_icon()}
  </button>
</div>

<Dialog {open} onOpenChange={(e) => (open = e.open)}>
  <Portal>
    {#if open}
      <Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-950/50" />
      <Dialog.Positioner
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <Dialog.Content
          class="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 card bg-surface-50-950 p-6 shadow-xl"
        >
          <header class="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title class="text-lg font-bold">
                {m.categories_icon_picker_title()}
              </Dialog.Title>
              <Dialog.Description class="text-sm text-surface-600-400">
                {m.categories_icon_picker_description()}
              </Dialog.Description>
            </div>
            <Dialog.CloseTrigger
              class="btn-icon preset-tonal btn-icon-sm"
              aria-label={m.common_close()}
            >
              <X size={16} aria-hidden="true" />
            </Dialog.CloseTrigger>
          </header>

          <div class="field-group grid-cols-[auto_1fr]">
            <span class="label preset-tonal">
              <Search size={16} aria-hidden="true" />
            </span>
            <input
              class="input"
              type="search"
              placeholder={m.categories_icon_picker_search()}
              aria-label={m.categories_icon_picker_search()}
              bind:value={query}
            />
          </div>

          <div class="flex flex-col gap-5 overflow-y-auto pr-1">
            {#each groups as { group, icons } (group)}
              <section
                aria-label={iconGroupLabel(group)}
                class="flex flex-col gap-2"
              >
                <h3
                  class="text-xs font-bold tracking-wider uppercase opacity-60"
                >
                  {iconGroupLabel(group)}
                </h3>
                <ul
                  class="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2"
                >
                  {#each icons as icon (icon.name)}
                    {@const selected = icon.name === value}
                    <li>
                      <button
                        type="button"
                        aria-pressed={selected}
                        disabled={saving}
                        title={icon.label}
                        class="flex w-full flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition-colors {selected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-surface-200-800 hover:border-surface-400-600'}"
                        onclick={() => choose(icon)}
                      >
                        <icon.component size={22} aria-hidden="true" />
                        <span class="w-full truncate text-center font-medium">
                          {icon.label}
                        </span>
                      </button>
                    </li>
                  {/each}
                </ul>
              </section>
            {:else}
              <p class="py-8 text-center text-sm opacity-70">
                {m.categories_icon_picker_none({ query })}
              </p>
            {/each}
          </div>

          <footer class="flex justify-end">
            <button
              type="button"
              class="btn preset-tonal text-xs"
              disabled={saving || value === null}
              onclick={() => choose(null)}
            >
              {m.categories_icon_picker_use_default()}
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Positioner>
    {/if}
  </Portal>
</Dialog>

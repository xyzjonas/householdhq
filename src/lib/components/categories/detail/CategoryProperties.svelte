<script lang="ts">
  import { untrack } from "svelte";
  import { describeChanges } from "#lib/category-detail.ts";
  import { toaster } from "#lib/toaster.ts";
  import {
    patchCategory,
    type CategoryChanges,
  } from "#lib/categories-client.ts";
  import InlineField from "#lib/components/accounts/detail/InlineField.svelte";
  import type { Category } from "#lib/server/core/types.ts";
  import CategoryIconPicker from "./CategoryIconPicker.svelte";

  let { category }: { category: Category } = $props();

  // The page re-keys this component per category, so the initial value is enough.
  let current = $state<Category>(untrack(() => ({ ...category })));

  /** Apply optimistically, roll back when the server refuses. */
  async function save(changes: CategoryChanges) {
    const before = { ...current };
    Object.assign(current, changes);
    try {
      current = await patchCategory(category.id, changes);
      for (const title of describeChanges(changes)) {
        toaster.success({ title });
      }
    } catch (e) {
      current = before;
      toaster.error({
        title: "Could not save the change",
        description: e instanceof Error ? e.message : undefined,
      });
      throw e;
    }
  }

  // The colour picker and icon select have no field to keep open, so a
  // failure is only surfaced through the error toast.
  const quiet = (changes: CategoryChanges) => save(changes).catch(() => {});
</script>

<section
  aria-labelledby="properties-heading"
  class="flex flex-col gap-4 card border border-surface-200-800 p-6"
>
  <header class="flex flex-col gap-1">
    <h2 id="properties-heading" class="text-lg font-bold">
      Category configuration & properties
    </h2>
    <p class="text-sm text-surface-600-400">
      Changes are saved as soon as you make them · Category ID: {category.id}
    </p>
  </header>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <InlineField
      label="Category name"
      value={current.name}
      onsave={(name) => save({ name })}
    />
    <InlineField
      label="Description"
      value={current.description ?? ""}
      required={false}
      placeholder="What belongs in this category"
      onsave={(description) => save({ description })}
    />
    <CategoryIconPicker
      value={current.icon}
      onsave={(icon) => quiet({ icon })}
    />
    <div
      class="flex items-center justify-between gap-3 rounded-xl border border-surface-200-800 bg-surface-100-900/70 p-3.5"
    >
      <div class="min-w-0">
        <p class="text-xs font-bold tracking-wider uppercase opacity-60">
          Accent theme
        </p>
        <p class="flex items-center gap-2 text-base font-bold">
          <span
            class="size-4 rounded-full border border-surface-300-700"
            style:background-color={current.color ?? "transparent"}
            aria-hidden="true"
          ></span>
          {current.color ?? "None"}
        </p>
      </div>
      <label class="btn cursor-pointer rounded-full preset-tonal text-xs">
        Pick color
        <input
          type="color"
          class="sr-only"
          value={current.color ?? "#64748b"}
          onchange={(e) => quiet({ color: e.currentTarget.value })}
        />
      </label>
    </div>
  </div>
</section>

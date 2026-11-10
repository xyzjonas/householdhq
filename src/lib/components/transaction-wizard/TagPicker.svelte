<script lang="ts">
  import { TagsInput } from "@skeletonlabs/skeleton-svelte";
  import { m } from "#paraglide/messages.js";
  import {
    chipClass,
    chipInteractiveClass,
    chipStyle,
  } from "#lib/components/chip.ts";
  import type { WizardTag } from "./types";
  import Plus from "@lucide/svelte/icons/plus";
  import X from "@lucide/svelte/icons/x";

  let {
    value = $bindable(),
    options,
  }: {
    /** Names of the chosen tags. */
    value: string[];
    /** All existing tags, offered as suggestions. */
    options: WizardTag[];
  } = $props();

  const MAX_SUGGESTIONS = 12;

  const has = (name: string) =>
    value.some((v) => v.toLowerCase() === name.toLowerCase());
  const colorOf = (name: string) =>
    options.find((o) => o.name.toLowerCase() === name.toLowerCase())?.color;
  const suggestions = $derived(
    options.filter((o) => !has(o.name)).slice(0, MAX_SUGGESTIONS),
  );
</script>

<div class="flex flex-col gap-2">
  <TagsInput
    {value}
    onValueChange={(e) => (value = e.value)}
    editable={false}
    blurBehavior="add"
    validate={(d) =>
      !value.some((v) => v.toLowerCase() === d.inputValue.toLowerCase())}
  >
    <TagsInput.Label class="sr-only">{m.wizard_tags()}</TagsInput.Label>
    <TagsInput.Context>
      {#snippet children(tagsInput)}
        <TagsInput.Control class="input flex h-auto flex-wrap gap-2 py-2">
          {#each tagsInput().value as tag, index (tag)}
            <TagsInput.Item value={tag} {index}>
              <TagsInput.ItemPreview
                class="{chipClass} text-surface-950-50"
                style={chipStyle(colorOf(tag))}
              >
                <TagsInput.ItemText>{tag}</TagsInput.ItemText>
                <TagsInput.ItemDeleteTrigger
                  class="grid size-4 place-items-center rounded-full hover:bg-surface-500/20"
                  aria-label={m.wizard_tag_remove({ tag })}
                >
                  <X size={12} aria-hidden="true" />
                </TagsInput.ItemDeleteTrigger>
              </TagsInput.ItemPreview>
            </TagsInput.Item>
          {/each}
          <TagsInput.Input
            class="min-w-32 flex-1 border-0 bg-transparent p-0 focus:ring-0"
            placeholder={value.length
              ? m.wizard_tag_add_another()
              : m.wizard_tag_type_and_enter()}
            maxlength={50}
          />
        </TagsInput.Control>
      {/snippet}
    </TagsInput.Context>
  </TagsInput>

  {#each value as tag (tag)}
    <input type="hidden" name="tags" value={tag} />
  {/each}

  {#if suggestions.length}
    <ul class="flex flex-wrap gap-1.5" aria-label={m.wizard_tag_existing()}>
      {#each suggestions as { name, color } (name)}
        <li>
          <button
            type="button"
            class="{chipClass} {chipInteractiveClass} text-surface-950-50"
            style={chipStyle(color)}
            onclick={() => (value = [...value, name])}
          >
            <Plus size={12} aria-hidden="true" />
            {name}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

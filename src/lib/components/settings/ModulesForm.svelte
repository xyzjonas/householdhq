<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import { tick } from "svelte";
  import { MODULES, type ModuleKey } from "#lib/modules.ts";
  import { toaster } from "#lib/toaster.ts";

  let { enabled }: { enabled: readonly ModuleKey[] } = $props();

  let form: HTMLFormElement | undefined = $state();

  // Saves as soon as a switch flips. The hidden inputs follow the switch state
  // a tick later, so wait for them before submitting.
  async function save() {
    await tick();
    form?.requestSubmit();
  }
</script>

<section class="flex flex-col gap-4 card bg-surface-50-950 p-6">
  <header class="flex flex-col gap-1">
    <h2 class="text-lg font-bold">{m.settings_modules_title()}</h2>
    <p class="text-sm text-surface-600-400">{m.settings_modules_hint()}</p>
  </header>
  <form
    bind:this={form}
    method="POST"
    action="?/modules"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          toaster.success({ title: m.settings_modules_saved() });
          // The navigation reads the modules from the layout data.
          await invalidateAll();
        } else {
          toaster.error({ title: m.settings_modules_failed() });
        }
      };
    }}
  >
    <ul class="flex flex-col gap-4">
      {#each MODULES as module (module.key)}
        <li>
          <Switch
            name="enabledModules"
            value={module.key}
            defaultChecked={enabled.includes(module.key)}
            onCheckedChange={save}
            class="flex w-full items-center justify-between gap-4"
          >
            <span class="flex flex-col">
              <Switch.Label>{module.label()}</Switch.Label>
              <span class="text-xs text-surface-600-400">
                {module.description()}
              </span>
            </span>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.HiddenInput />
          </Switch>
        </li>
      {/each}
    </ul>
  </form>
</section>

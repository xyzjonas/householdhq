<script lang="ts">
  import { resolve } from "$app/paths";
  import CurrencyForm from "#lib/components/settings/CurrencyForm.svelte";
  import ThemeForm from "#lib/components/settings/ThemeForm.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Settings · Household HQ</title></svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <header class="flex flex-col gap-2">
    <nav aria-label="Breadcrumb" class="text-sm text-surface-600-400">
      <ol class="flex gap-2">
        <li><a class="anchor" href={resolve("/")}>Home</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">Settings</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-extrabold tracking-tight">Settings</h1>
  </header>

  <CurrencyForm
    currency={data.settings.currency}
    currencies={data.currencies}
    message={form && "message" in form ? form.message : ""}
    saved={form !== null && "saved" in form}
  />

  <ThemeForm />
</div>

<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import CurrencyForm from "#lib/components/settings/CurrencyForm.svelte";
  import FiscalIntervalForm from "#lib/components/settings/FiscalIntervalForm.svelte";
  import DefaultOutAccountForm from "#lib/components/settings/DefaultOutAccountForm.svelte";
  import MankoCategoryForm from "#lib/components/settings/MankoCategoryForm.svelte";
  import LanguageForm from "#lib/components/settings/LanguageForm.svelte";
  import ThemeForm from "#lib/components/settings/ThemeForm.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<svelte:head
  ><title>{m.settings_page_title()} · {m.common_app_name()}</title></svelte:head
>

<div class="mx-auto flex max-w-3xl flex-col gap-6">
  <header class="flex flex-col gap-2">
    <nav
      aria-label={m.common_breadcrumb()}
      class="text-sm text-surface-600-400"
    >
      <ol class="flex gap-2">
        <li><a class="anchor" href={resolve("/")}>{m.common_home()}</a></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">{m.settings_page_title()}</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-extrabold tracking-tight">
      {m.settings_page_title()}
    </h1>
  </header>

  <CurrencyForm
    currency={data.settings.currency}
    currencies={data.currencies}
    message={form && "message" in form ? form.message : ""}
    saved={form !== null && "saved" in form}
  />

  <FiscalIntervalForm
    startDay={data.settings.fiscalIntervalStartDay}
    message={form && "intervalMessage" in form ? form.intervalMessage : ""}
    saved={form !== null && "intervalSaved" in form}
  />

  <MankoCategoryForm
    categoryId={data.settings.mankoCategoryId}
    categories={data.categories}
    message={form && "mankoMessage" in form ? form.mankoMessage : ""}
    saved={form !== null && "mankoSaved" in form}
  />

  <DefaultOutAccountForm
    accountId={data.settings.defaultOutAccountId}
    accounts={data.outAccounts}
    message={form && "defaultOutMessage" in form ? form.defaultOutMessage : ""}
    saved={form !== null && "defaultOutSaved" in form}
  />

  <ThemeForm />

  <LanguageForm />
</div>

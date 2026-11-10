<script lang="ts">
  import { page } from "$app/state";
  import { m } from "#paraglide/messages.js";
  import TransactionWizard from "#lib/components/transaction-wizard/TransactionWizard.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const requested = $derived(Number(page.url.searchParams.get("account")));
  const initialAccountId = $derived(
    data.accounts.find((a) => a.id === requested && !a.isOut)?.id ?? null,
  );
</script>

<svelte:head
  ><title>{m.wizard_title_new()} · {m.common_app_name()}</title></svelte:head
>

<!-- Every itemizing round lands here with new arguments: start it afresh. -->
{#key page.url.search}
  <TransactionWizard
    accounts={data.accounts}
    categories={data.categories}
    suggestions={data.suggestions}
    tagOptions={data.tags}
    {initialAccountId}
    defaultOutAccountId={data.defaultOutAccountId}
    itemize={data.itemize ?? undefined}
    action="?/create"
    errors={form?.errors ?? []}
  />
{/key}

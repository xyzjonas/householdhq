<script lang="ts">
  import { page } from "$app/state";
  import TransactionWizard from "#lib/components/transaction-wizard/TransactionWizard.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const requested = $derived(Number(page.url.searchParams.get("account")));
  const initialAccountId = $derived(
    data.accounts.find((a) => a.id === requested && !a.isOut)?.id ?? null,
  );
</script>

<svelte:head><title>New record · Household HQ</title></svelte:head>

<TransactionWizard
  accounts={data.accounts}
  categories={data.categories}
  suggestions={data.suggestions}
  {initialAccountId}
  errors={form?.errors ?? []}
/>

<script lang="ts">
  import TransactionWizard from "#lib/components/transaction-wizard/TransactionWizard.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Edit record · Household HQ</title></svelte:head>

<TransactionWizard
  accounts={data.accounts}
  categories={data.categories}
  suggestions={data.suggestions}
  defaultOutAccountId={data.defaultOutAccountId}
  initial={data.transaction}
  action="?/update"
  errors={form?.errors ?? []}
/>

<script lang="ts">
  import TransactionWizard from "#lib/components/transaction-wizard/TransactionWizard.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>New record · Household HQ</title></svelte:head>

<TransactionWizard
  accounts={data.accounts}
  categories={data.categories}
  suggestions={data.suggestions}
  errors={form?.errors ?? []}
/>

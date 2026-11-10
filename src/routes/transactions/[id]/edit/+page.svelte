<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import TransactionWizard from "#lib/components/transaction-wizard/TransactionWizard.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<svelte:head
  ><title>{m.wizard_title_edit()} · {m.common_app_name()}</title></svelte:head
>

<TransactionWizard
  accounts={data.accounts}
  categories={data.categories}
  suggestions={data.suggestions}
  tagOptions={data.tags}
  defaultOutAccountId={data.defaultOutAccountId}
  initial={data.transaction}
  action="?/update"
  errors={form?.errors ?? []}
/>

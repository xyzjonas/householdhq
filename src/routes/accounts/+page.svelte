<script lang="ts">
  import { m } from "#paraglide/messages.js";
  import { resolve } from "$app/paths";
  import CreateAccountDialog from "#lib/components/accounts/CreateAccountDialog.svelte";
  import AccountDirectory from "#lib/components/accounts/AccountDirectory.svelte";
  import PillarAllocation from "#lib/components/accounts/PillarAllocation.svelte";
  import { buildPillars, netWorthOf } from "#lib/accounts-view.ts";
  import { formatMoney } from "#lib/format.ts";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const pillars = $derived(buildPillars(data.accounts));
  const netWorth = $derived(netWorthOf(data.accounts));
</script>

<svelte:head
  ><title>{m.accounts_page_title({ app: m.common_app_name() })}</title
  ></svelte:head
>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex flex-col gap-2">
      <nav
        aria-label={m.accounts_breadcrumb_label()}
        class="text-sm text-surface-600-400"
      >
        <ol class="flex gap-2">
          <li>
            <a class="anchor" href={resolve("/")}
              >{m.accounts_breadcrumb_home()}</a
            >
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">
            {m.accounts_breadcrumb_total({ count: data.accounts.length })}
          </li>
        </ol>
      </nav>
      <h1 class="text-2xl font-extrabold tracking-tight">
        {m.accounts_heading()}
      </h1>
    </div>
    <CreateAccountDialog message={form?.message} />
  </header>

  <section
    aria-labelledby="net-worth-heading"
    class="flex flex-col gap-1 card border border-surface-200-800 p-6"
  >
    <h2
      id="net-worth-heading"
      class="text-xs font-bold tracking-wider uppercase opacity-60"
    >
      {m.accounts_net_worth_heading()}
    </h2>
    <p class="text-3xl font-extrabold tracking-tight md:text-4xl">
      {formatMoney(netWorth)}
    </p>
  </section>

  <PillarAllocation {pillars} />
  <AccountDirectory accounts={data.accounts} />
</div>

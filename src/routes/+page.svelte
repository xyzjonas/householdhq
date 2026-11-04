<script lang="ts">
  import AccountList from "#lib/components/AccountList.svelte";
  import AllocationBar, {
    type Segment,
  } from "#lib/components/AllocationBar.svelte";
  import BalanceCard from "#lib/components/BalanceCard.svelte";
  import TransactionList from "#lib/components/TransactionList.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const portfolio = $derived<Segment[]>([
    {
      label: "Bank",
      amount: data.balances.byType.ACCOUNT ?? 0,
      color: "bg-slate-900",
    },
    {
      label: "Cash",
      amount: data.balances.byType.CASH ?? 0,
      color: "bg-slate-400",
    },
    {
      label: "Savings",
      amount: data.balances.byType.SAVINGS ?? 0,
      color: "bg-emerald-500",
    },
    {
      label: "Investments",
      amount: data.balances.byType.INVESTMENT ?? 0,
      color: "bg-blue-500",
    },
  ]);
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-8">
  <h1 class="sr-only">Dashboard</h1>

  <section aria-labelledby="balances-heading" class="grid gap-4 sm:grid-cols-2">
    <h2 id="balances-heading" class="sr-only">Balances</h2>
    <BalanceCard
      featured
      label="Total liquid balance"
      amount={data.balances.liquid}
      hint="Available to spend"
    />
    <BalanceCard
      label="Household net worth"
      amount={data.balances.total}
      hint="All owned accounts"
    />
  </section>

  <section aria-labelledby="accounts-heading" class="flex flex-col gap-4">
    <h2 id="accounts-heading" class="text-xl font-bold">Accounts</h2>
    <AllocationBar segments={portfolio} />
    <AccountList accounts={data.accounts.filter((a) => !a.isOut)} />
  </section>

  <section aria-labelledby="transactions-heading" class="flex flex-col gap-4">
    <h2 id="transactions-heading" class="text-xl font-bold">
      Recent transactions
    </h2>
    <TransactionList transactions={data.transactions} />
  </section>
</div>

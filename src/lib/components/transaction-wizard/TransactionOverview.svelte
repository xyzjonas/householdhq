<script lang="ts">
  import { categoryIcon, fallbackColor } from "./category-icons";
  import {
    transactionTypes,
    type Currency,
    type TransactionType,
    type WizardCategory,
  } from "./types";

  let {
    stage,
    reached,
    type,
    amount,
    currency,
    category,
    accountName,
    targetName,
    description,
    date,
    time,
    recurring,
    recurringMonths,
    hidden,
    important,
    tags,
  }: {
    /** Stage currently shown in the carousel. */
    stage: number;
    /** Furthest stage the user has visited so far. */
    reached: number;
    type: TransactionType;
    amount: number;
    currency: Currency;
    category: WizardCategory | undefined;
    accountName: string | undefined;
    targetName: string | undefined;
    description: string;
    date: string;
    time: string;
    recurring: boolean;
    recurringMonths: number;
    hidden: boolean;
    important: boolean;
    tags: string[];
  } = $props();

  const money = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sections = [
    { n: 1, title: "Type" },
    { n: 2, title: "Amount" },
    { n: 3, title: "Category" },
    { n: 4, title: "Details" },
  ];

  const typeInfo = $derived(transactionTypes.find((t) => t.value === type));
  const CategoryIcon = $derived(categoryIcon(category?.icon ?? null));
  // Defaults (account, "now") only count once the user actually reached the form.
  const detailsReached = $derived(reached >= 4);
  const account = $derived(detailsReached ? accountName : undefined);
  const flags = $derived(
    [
      recurring &&
        (recurringMonths === 1
          ? "Every month"
          : `Every ${recurringMonths} months`),
      hidden && "Hidden",
      important && "Important",
    ].filter((f): f is string => !!f),
  );
  const when = $derived(
    detailsReached && date && time
      ? new Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(`${date}T${time}`))
      : undefined,
  );
</script>

<aside
  aria-label="Transaction overview"
  class="hidden flex-col gap-6 rounded-2xl border border-surface-200-800 bg-surface-50-950 p-6 lg:flex"
>
  <header class="flex flex-col gap-1">
    <h2
      class="text-xs font-semibold tracking-[0.04em] text-surface-600-400 uppercase"
    >
      Overview
    </h2>
    <p
      class="text-4xl font-extrabold tracking-[-0.03em] {amount > 0
        ? 'text-surface-950-50'
        : 'text-surface-400-600'}"
    >
      {money.format(amount)}
      <span class="text-sm font-bold uppercase">{currency}</span>
    </p>
  </header>

  <ol class="flex flex-col">
    {#each sections as s (s.n)}
      <li
        class="flex flex-col gap-3 border-t border-surface-200-800 py-4 first:border-t-0 first:pt-0"
        aria-current={stage === s.n ? "step" : undefined}
      >
        <h3
          class="flex items-center gap-2 text-xs font-semibold tracking-[0.04em] uppercase {stage ===
          s.n
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-surface-600-400'}"
        >
          <span
            class="flex size-5 items-center justify-center rounded-full text-[0.65rem] text-white {reached >=
            s.n
              ? 'bg-[#10b981]'
              : 'bg-surface-400-600'}"
            aria-hidden="true">{s.n}</span
          >
          {s.title}
        </h3>

        {#if s.n === 1}
          <p class="flex items-center gap-2 font-semibold">
            <span class="size-2.5 rounded-full {typeInfo?.dot}"></span>
            {typeInfo?.label}
            <span class="text-sm font-normal text-surface-600-400"
              >· {typeInfo?.hint}</span
            >
          </p>
        {:else if s.n === 2}
          <p class={amount > 0 ? "font-semibold" : "placeholder-text"}>
            {amount > 0 ? `${money.format(amount)} ${currency}` : "Not entered"}
          </p>
        {:else if s.n === 3}
          <p class="flex items-center gap-3">
            {#if category}
              <span
                class="rounded-lg p-2 text-white"
                style="background-color: {category.color ?? fallbackColor}"
              >
                <CategoryIcon size={16} aria-hidden="true" />
              </span>
              <span class="font-semibold">{category.name}</span>
            {:else}
              <span class="placeholder-text">Not chosen</span>
            {/if}
          </p>
        {:else}
          <dl class="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 text-sm">
            <dt class="text-surface-600-400">
              {type === "TRANSFER" ? "From" : "Account"}
            </dt>
            <dd class={account ? "font-semibold" : "placeholder-text"}>
              {account ?? "Not chosen"}
            </dd>
            {#if type !== "INCOME"}
              <dt class="text-surface-600-400">
                {type === "TRANSFER" ? "To" : "Paid to"}
              </dt>
              <dd class={targetName ? "font-semibold" : "placeholder-text"}>
                {targetName ?? "Not chosen"}
              </dd>
            {/if}
            <dt class="text-surface-600-400">Description</dt>
            <dd
              class={description
                ? "font-semibold break-words"
                : "placeholder-text"}
            >
              {description || "None yet"}
            </dd>
            <dt class="text-surface-600-400">When</dt>
            <dd class={when ? "font-semibold" : "placeholder-text"}>
              {when ?? "Not set"}
            </dd>
            <dt class="text-surface-600-400">Tags</dt>
            <dd class="flex flex-wrap gap-1.5">
              {#each tags as tag (tag)}
                <span class="badge preset-tonal">{tag}</span>
              {:else}
                <span class="placeholder-text">None</span>
              {/each}
            </dd>
            <dt class="text-surface-600-400">Flags</dt>
            <dd class="flex flex-wrap gap-1.5">
              {#each flags as f (f)}
                <span class="badge preset-tonal">{f}</span>
              {:else}
                <span class="placeholder-text">None</span>
              {/each}
            </dd>
          </dl>
        {/if}
      </li>
    {/each}
  </ol>
</aside>

<style scoped>
  .placeholder-text {
    font-style: italic;
    color: light-dark(#94a3b8, #64748b);
  }
</style>

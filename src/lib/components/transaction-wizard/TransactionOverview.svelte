<script lang="ts">
  import Chip from "#lib/components/Chip.svelte";
  import { intlLocale } from "#lib/i18n.ts";
  import { m } from "#paraglide/messages.js";
  import { categoryIcon, fallbackColor } from "./category-icons";
  import {
    transactionTypes,
    typeHint,
    typeLabel,
    type Currency,
    type TransactionType,
    type WizardCategory,
    type WizardTag,
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
    tags: WizardTag[];
  } = $props();

  const money = $derived(
    new Intl.NumberFormat(intlLocale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );

  const sections = $derived([
    { n: 1, title: m.wizard_overview_section_type() },
    { n: 2, title: m.wizard_overview_section_amount() },
    { n: 3, title: m.wizard_overview_section_category() },
    { n: 4, title: m.wizard_overview_section_details() },
  ]);

  const typeInfo = $derived(transactionTypes.find((t) => t.value === type));
  const CategoryIcon = $derived(categoryIcon(category?.icon ?? null));
  // Defaults (account, "now") only count once the user actually reached the form.
  const detailsReached = $derived(reached >= 4);
  const account = $derived(detailsReached ? accountName : undefined);
  const flags = $derived([
    ...(recurring
      ? [m.wizard_overview_every_months({ count: recurringMonths })]
      : []),
    ...(hidden ? [m.wizard_overview_flag_hidden()] : []),
    ...(important ? [m.wizard_overview_flag_important()] : []),
  ]);
  const when = $derived(
    detailsReached && date && time
      ? new Intl.DateTimeFormat(intlLocale(), {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(`${date}T${time}`))
      : undefined,
  );
</script>

<aside
  aria-label={m.wizard_overview_label()}
  class="hidden flex-col gap-6 rounded-2xl border border-surface-200-800 bg-surface-50-950 p-6 lg:flex"
>
  <header class="flex flex-col gap-1">
    <h2
      class="text-xs font-semibold tracking-[0.04em] text-surface-600-400 uppercase"
    >
      {m.wizard_overview_title()}
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
            {typeInfo ? typeLabel(typeInfo.value) : ""}
            <span class="text-sm font-normal text-surface-600-400"
              >· {typeInfo ? typeHint(typeInfo.value) : ""}</span
            >
          </p>
        {:else if s.n === 2}
          <p class={amount > 0 ? "font-semibold" : "placeholder-text"}>
            {amount > 0
              ? `${money.format(amount)} ${currency}`
              : m.wizard_overview_not_entered()}
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
              <span class="placeholder-text">{m.wizard_not_chosen()}</span>
            {/if}
          </p>
        {:else}
          <dl class="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 text-sm">
            <dt class="text-surface-600-400">
              {type === "TRANSFER" ? m.wizard_from() : m.wizard_account()}
            </dt>
            <dd class={account ? "font-semibold" : "placeholder-text"}>
              {account ?? m.wizard_not_chosen()}
            </dd>
            {#if type !== "INCOME"}
              <dt class="text-surface-600-400">
                {type === "TRANSFER" ? m.wizard_to() : m.wizard_paid_to()}
              </dt>
              <dd class={targetName ? "font-semibold" : "placeholder-text"}>
                {targetName ?? m.wizard_not_chosen()}
              </dd>
            {/if}
            <dt class="text-surface-600-400">{m.wizard_description()}</dt>
            <dd
              class={description
                ? "font-semibold break-words"
                : "placeholder-text"}
            >
              {description || m.wizard_overview_none_yet()}
            </dd>
            <dt class="text-surface-600-400">{m.wizard_overview_when()}</dt>
            <dd class={when ? "font-semibold" : "placeholder-text"}>
              {when ?? m.wizard_overview_not_set()}
            </dd>
            <dt class="text-surface-600-400">{m.wizard_tags()}</dt>
            <dd class="flex flex-wrap gap-1.5">
              {#each tags as tag (tag.name)}
                <Chip color={tag.color}>{tag.name}</Chip>
              {:else}
                <span class="placeholder-text">{m.common_none()}</span>
              {/each}
            </dd>
            <dt class="text-surface-600-400">{m.wizard_overview_flags()}</dt>
            <dd class="flex flex-wrap gap-1.5">
              {#each flags as f (f)}
                <Chip>{f}</Chip>
              {:else}
                <span class="placeholder-text">{m.common_none()}</span>
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

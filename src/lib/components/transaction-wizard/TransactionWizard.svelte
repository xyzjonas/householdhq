<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Check from "@lucide/svelte/icons/check";
  import X from "@lucide/svelte/icons/x";
  import { tick, untrack } from "svelte";
  import AmountStage from "./AmountStage.svelte";
  import { evaluate } from "./calculator";
  import CategoryStage from "./CategoryStage.svelte";
  import DetailsStage from "./DetailsStage.svelte";
  import TransactionOverview from "./TransactionOverview.svelte";
  import TypeStage from "./TypeStage.svelte";
  import {
    stages,
    type Currency,
    type TransactionType,
    type WizardAccount,
    type WizardCategory,
  } from "./types";

  let {
    accounts,
    categories,
    suggestions = [],
    errors = [],
    initialAccountId = null,
    onsplit,
  }: {
    accounts: WizardAccount[];
    categories: WizardCategory[];
    /** Previously used descriptions offered as autocomplete. */
    suggestions?: string[];
    /** Server side validation messages to surface after a failed submit. */
    errors?: string[];
    /** Account to pre-select as the source. */
    initialAccountId?: number | null;
    /** Enables the "Split" banner on the amount stage. */
    onsplit?: (amount: number) => void;
  } = $props();

  const pad = (n: number) => String(n).padStart(2, "0");
  const now = new Date();

  let stage = $state(1);
  let type = $state<TransactionType>("EXPENSE");
  let tape = $state("");
  let currency = $state<Currency>("CZK");
  let categoryId = $state<number | null>(null);
  let chosenSourceId = $state<number | null>(untrack(() => initialAccountId));
  const sourceId = $derived(
    chosenSourceId ?? accounts.find((a) => !a.isOut)?.id ?? null,
  );
  let targetId = $state<number | null>(null);
  let description = $state("");
  let date = $state(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  );
  let time = $state(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  let recurring = $state(false);
  let hidden = $state(false);
  let important = $state(false);
  let saving = $state(false);
  let heading = $state<HTMLElement>();
  let reached = $state(1);
  let details = $state<ReturnType<typeof DetailsStage>>();

  const amount = $derived(evaluate(tape));
  const category = $derived(categories.find((c) => c.id === categoryId));
  const accountName = $derived(accounts.find((a) => a.id === sourceId)?.name);
  const targetName = $derived(accounts.find((a) => a.id === targetId)?.name);
  const transactedAt = $derived.by(() => {
    const d = new Date(`${date}T${time}`);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  });

  const canAdvance = $derived(
    stage === 2
      ? amount > 0
      : stage === 3
        ? categoryId !== null
        : stage === 4
          ? sourceId !== null &&
            transactedAt !== "" &&
            (type !== "TRANSFER" ||
              (targetId !== null && targetId !== sourceId))
          : true,
  );

  async function goTo(next: number) {
    if (next < 1 || next > stages.length) return;
    // Entering the category stage settles any pending formula on the tape.
    if (next >= 3 && stage <= 2) tape = amount > 0 ? String(amount) : "";
    stage = next;
    reached = Math.max(reached, next);
    await tick();
    window.scrollTo({ top: 0 });
    if (next === stages.length) details?.focusDescription();
    else heading?.focus();
  }

  function setType(next: TransactionType) {
    // "Hidden" is both a type and a flag; keep the two in sync.
    hidden = next === "HIDDEN";
    if (next !== "TRANSFER") targetId = null;
    goTo(2);
  }
</script>

<form
  method="POST"
  class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[2fr_1fr] lg:items-start"
  use:enhance={({ cancel }) => {
    if (stage !== stages.length || !canAdvance) {
      cancel();
      return;
    }
    saving = true;
    return async ({ update }) => {
      await update({ reset: false });
      saving = false;
    };
  }}
>
  <div class="mx-auto flex w-full max-w-[390px] flex-col gap-4 lg:max-w-none">
    <header class="flex items-center gap-3">
      <a
        href={resolve("/")}
        class="btn-icon size-10 rounded-full preset-tonal"
        aria-label="Cancel and go back"
      >
        <X size={18} aria-hidden="true" />
      </a>
      <h1 class="flex-1 text-center text-base font-bold text-surface-950-50">
        Add Transaction
      </h1>
      <span class="size-10" aria-hidden="true"></span>
    </header>

    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <span
          class="flex size-8 items-center justify-center rounded-full bg-[#10b981] text-sm font-bold text-white"
          aria-hidden="true">{stage}</span
        >
        <h2
          bind:this={heading}
          tabindex="-1"
          class="text-sm font-semibold text-surface-950-50 outline-none"
        >
          <span class="sr-only">Step {stage} of {stages.length}:</span>
          {stages[stage - 1].title}
        </h2>
      </div>
      <ol class="grid grid-cols-4 gap-2" aria-hidden="true">
        {#each stages as s, i (s.title)}
          <li
            class="h-1.5 rounded-full transition-colors {i + 1 < stage
              ? 'bg-[#10b981]'
              : i + 1 === stage
                ? 'bg-[#059669]'
                : 'bg-surface-200-800'}"
          ></li>
        {/each}
      </ol>
    </div>

    {#if errors.length > 0}
      <ul
        role="alert"
        class="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-3 text-sm font-semibold text-[#991b1b] dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
      >
        {#each errors as e (e)}<li>{e}</li>{/each}
      </ul>
    {/if}

    <div class="overflow-hidden">
      <div
        class="track flex items-start"
        style="transform: translateX(-{(stage - 1) * 100}%)"
      >
        <section class="panel" inert={stage !== 1} aria-label={stages[0].title}>
          <TypeStage bind:value={type} onchange={setType} />
        </section>
        <section class="panel" inert={stage !== 2} aria-label={stages[1].title}>
          <AmountStage
            bind:tape
            bind:currency
            {category}
            {onsplit}
            onchangecategory={() => goTo(3)}
          />
        </section>
        <section class="panel" inert={stage !== 3} aria-label={stages[2].title}>
          <CategoryStage
            {categories}
            bind:value={categoryId}
            onselect={() => goTo(4)}
          />
        </section>
        <section class="panel" inert={stage !== 4} aria-label={stages[3].title}>
          <DetailsStage
            bind:this={details}
            {type}
            {accounts}
            {suggestions}
            bind:sourceId={() => sourceId, (id) => (chosenSourceId = id)}
            bind:targetId
            bind:description
            bind:date
            bind:time
            bind:recurring
            bind:hidden
            bind:important
          />
        </section>
      </div>
    </div>

    <input type="hidden" name="amount" value={amount} />
    <input type="hidden" name="currency" value={currency} />
    <input type="hidden" name="transactedAt" value={transactedAt} />

    <nav
      aria-label="Wizard steps"
      class="dock fixed inset-x-0 bottom-0 z-20 border-t border-surface-200-800 bg-surface-50-950/95 p-4 backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:p-0"
    >
      <div
        class="mx-auto flex max-w-[390px] items-center justify-between gap-3 lg:max-w-none"
      >
        {#if stage === 1}
          <a
            href={resolve("/")}
            class="flex size-12 shrink-0 items-center justify-center rounded-full border border-surface-200-800 bg-surface-50-950 active:bg-surface-200-800"
            aria-label="Cancel"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </a>
        {:else}
          <button
            type="button"
            class="flex size-12 shrink-0 items-center justify-center rounded-full border border-surface-200-800 bg-surface-50-950 active:bg-surface-200-800"
            aria-label="Previous step"
            onclick={() => goTo(stage - 1)}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
        {/if}

        <ol class="flex items-center gap-2" aria-hidden="true">
          {#each stages as s, i (s.title)}
            <li
              class="dot size-2.5 rounded-full {i + 1 === stage
                ? 'scale-125 bg-emerald-600'
                : 'bg-surface-200-800'}"
            ></li>
          {/each}
        </ol>

        {#if stage < stages.length}
          <button
            type="button"
            class="cta flex items-center gap-2 rounded-full bg-[#006c48] px-6 py-3.5 font-bold text-white shadow-sm active:scale-95 disabled:opacity-40"
            disabled={!canAdvance}
            onclick={() => goTo(stage + 1)}
          >
            {stages[stage - 1].next}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        {:else}
          <button
            type="submit"
            class="cta flex h-14 items-center justify-center gap-2 rounded-full bg-surface-950-50 px-6 font-bold text-surface-50-950 active:scale-95 disabled:opacity-40"
            disabled={!canAdvance || saving}
          >
            {saving ? "Saving…" : stages[stage - 1].next}
            <Check size={18} aria-hidden="true" />
          </button>
        {/if}
      </div>
    </nav>
  </div>

  <TransactionOverview
    {stage}
    {reached}
    {type}
    {amount}
    {currency}
    {category}
    {accountName}
    {targetName}
    {description}
    {date}
    {time}
    {recurring}
    {hidden}
    {important}
  />
</form>

<style scoped>
  .track {
    transition: transform 300ms ease;
  }
  .panel {
    width: 100%;
    flex-shrink: 0;
    padding: 0.25rem;
  }
  /* Collapse off-screen panels once the slide finishes so the page doesn't
     keep the height of the tallest stage. */
  .panel[inert] {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0s 300ms;
  }
  .dot,
  .cta {
    transition:
      transform 150ms,
      background-color 150ms;
  }
  @media (prefers-reduced-motion: reduce) {
    .track,
    .panel[inert],
    .dot,
    .cta {
      transition: none;
    }
  }
</style>

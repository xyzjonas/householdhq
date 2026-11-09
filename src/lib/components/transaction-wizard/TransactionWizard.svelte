<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import Check from "@lucide/svelte/icons/check";
  import Receipt from "@lucide/svelte/icons/receipt";
  import X from "@lucide/svelte/icons/x";
  import { tick, untrack } from "svelte";
  import { formatDate } from "#lib/format.ts";
  import { toaster } from "#lib/toaster.ts";
  import AmountStage from "./AmountStage.svelte";
  import { evaluate } from "./calculator";
  import CategoryStage from "./CategoryStage.svelte";
  import DeleteTransactionDialog from "./DeleteTransactionDialog.svelte";
  import DetailsStage from "./DetailsStage.svelte";
  import TransactionOverview from "./TransactionOverview.svelte";
  import TypeStage from "./TypeStage.svelte";
  import ItemizePanel from "./ItemizePanel.svelte";
  import {
    isExpenseLike,
    stages,
    type Currency,
    type ItemizeContext,
    type TransactionType,
    type WizardAccount,
    type WizardCategory,
    type WizardInitial,
    type WizardTag,
  } from "./types";

  let {
    accounts,
    categories,
    suggestions = [],
    tagOptions = [],
    errors = [],
    initialAccountId = null,
    defaultOutAccountId = null,
    initial,
    itemize,
    action,
    onsplit,
  }: {
    accounts: WizardAccount[];
    categories: WizardCategory[];
    /** Previously used descriptions offered as autocomplete. */
    suggestions?: string[];
    /** The existing tags offered in the tag picker. */
    tagOptions?: WizardTag[];
    /** Server side validation messages to surface after a failed submit. */
    errors?: string[];
    /** Account to pre-select as the source. */
    initialAccountId?: number | null;
    /** External account expenses are paid to unless another is picked. */
    defaultOutAccountId?: number | null;
    /** Existing values; switches the wizard into edit mode. */
    initial?: WizardInitial;
    /** A receipt being itemized: the new transaction is split off its parent. */
    itemize?: ItemizeContext;
    /** Form action to post to; defaults to the page's default action. */
    action?: string;
    /** Enables the "Split" banner on the amount stage. */
    onsplit?: (amount: number) => void;
  } = $props();

  const pad = (n: number) => String(n).padStart(2, "0");
  const seed = untrack(() => initial);
  const editing = seed !== undefined;
  const split = untrack(() => itemize)?.parent;
  const itemizing = split !== undefined;
  // Items share the receipt's details; the type stage has nothing to ask.
  const firstStage = itemizing ? 2 : 1;
  const now = new Date(seed?.transactedAt ?? split?.transactedAt ?? Date.now());

  let stage = $state(editing ? stages.length : firstStage);
  const initialType: TransactionType = seed?.type ?? "EXPENSE";
  let type = $state<TransactionType>(initialType);
  let tape = $state(seed ? String(seed.amount) : "");
  let currency = $state<Currency>(seed?.currency ?? split?.currency ?? "CZK");
  let categoryId = $state<number | null>(seed?.categoryId ?? null);
  let chosenSourceId = $state<number | null>(
    seed?.accountId ?? split?.accountId ?? untrack(() => initialAccountId),
  );
  const sourceId = $derived(
    chosenSourceId ?? accounts.find((a) => !a.isOut)?.id ?? null,
  );
  // Expenses are paid to the default out account unless another is chosen.
  let targetId = $state<number | null>(
    seed
      ? seed.targetId
      : (split?.targetId ??
          (isExpenseLike(initialType)
            ? untrack(() => defaultOutAccountId)
            : null)),
  );
  let description = $state(seed?.description ?? "");
  let date = $state(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  );
  let time = $state(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  let recurring = $state((seed?.recurring ?? 0) > 0);
  let recurringMonths = $state(seed?.recurring || 1);
  let hidden = $state(seed?.hidden ?? split?.hidden ?? false);
  let important = $state(seed?.important ?? false);
  let tags = $state<string[]>(seed?.tags ?? []);
  let saving = $state(false);
  let confirmingDelete = $state(false);
  let heading = $state<HTMLElement>();
  let reached = $state(editing ? stages.length : firstStage);
  let details = $state<ReturnType<typeof DetailsStage>>();

  /** The chosen tags with their configured colours (new tags have none). */
  const chosenTags = $derived(
    tags.map(
      (name): WizardTag =>
        tagOptions.find((o) => o.name.toLowerCase() === name.toLowerCase()) ?? {
          name,
          color: null,
        },
    ),
  );
  const amount = $derived(evaluate(tape));
  const category = $derived(categories.find((c) => c.id === categoryId));
  const accountName = $derived(accounts.find((a) => a.id === sourceId)?.name);
  const targetName = $derived(accounts.find((a) => a.id === targetId)?.name);
  const transactedAt = $derived.by(() => {
    const d = new Date(`${date}T${time}`);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  });

  /** An item must leave something on the receipt's original transaction. */
  const fitsReceipt = $derived(!split || amount < split.amount);
  /** Recurring transactions can't be itemized; they would repeat the split. */
  const canItemize = $derived(
    !editing && type === "EXPENSE" && !recurring && amount > 0,
  );

  const canAdvance = $derived(
    stage === 2
      ? amount > 0 && fitsReceipt
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
    if (next < firstStage || next > stages.length) return;
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
    targetId = isExpenseLike(next) ? defaultOutAccountId : null;
    goTo(2);
  }
</script>

{#snippet deleteButton()}
  <button
    type="button"
    class="btn h-12 w-full preset-tonal-error"
    onclick={() => (confirmingDelete = true)}
  >
    <Trash2 size={18} aria-hidden="true" />
    Delete
  </button>
{/snippet}

<form
  method="POST"
  {action}
  class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr] lg:items-start"
  use:enhance={({ cancel }) => {
    if (stage !== stages.length || !canAdvance) {
      cancel();
      return;
    }
    saving = true;
    return async ({ result, update }) => {
      if (result.type === "success" && result.data?.created) {
        const nextAt = result.data.nextAt as string | null;
        toaster.success({
          title: nextAt
            ? `Transaction created and next one scheduled for ${formatDate(nextAt)}`
            : "Transaction created",
        });
        await goto(resolve("/"));
      } else {
        await update({ reset: false });
      }
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
        {editing
          ? "Edit Transaction"
          : itemizing
            ? "Itemize Receipt"
            : "Add Transaction"}
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
          {#if itemize}
            <div class="mb-4">
              <ItemizePanel {itemize} {categories} {amount} />
            </div>
          {/if}
          <AmountStage
            bind:tape
            bind:currency
            {category}
            {onsplit}
            lockCurrency={itemizing}
            active={stage === 2}
            onchangecategory={() => goTo(3)}
            onadvance={() => canAdvance && goTo(3)}
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
            {tagOptions}
            bind:sourceId={() => sourceId, (id) => (chosenSourceId = id)}
            bind:targetId
            bind:description
            bind:date
            bind:time
            bind:recurring
            bind:recurringMonths
            bind:hidden
            bind:important
            bind:tags
          />
          {#if editing}
            <div class="px-4 pt-4 lg:hidden">{@render deleteButton()}</div>
          {/if}
        </section>
      </div>
    </div>

    <input type="hidden" name="amount" value={amount} />
    <input type="hidden" name="currency" value={currency} />
    <input type="hidden" name="transactedAt" value={transactedAt} />
    {#if itemize}
      <input type="hidden" name="parent" value={itemize.parent.id} />
      <input
        type="hidden"
        name="items"
        value={itemize.items.map((i) => i.id).join(",")}
      />
    {/if}

    <nav
      aria-label="Wizard steps"
      class="dock fixed inset-x-0 bottom-0 z-20 flex flex-col-reverse gap-3 border-t border-surface-200-800 bg-surface-50-950/95 p-4 backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:p-0"
    >
      <div
        class="mx-auto flex w-full max-w-[390px] items-center justify-between gap-3 lg:max-w-none"
      >
        {#if stage === firstStage}
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
            {saving
              ? "Saving…"
              : editing
                ? "Save changes"
                : itemizing
                  ? "Finish"
                  : stages[stage - 1].next}
            <Check size={18} aria-hidden="true" />
          </button>
        {/if}
      </div>
      <!-- After the main button in the DOM so Enter still submits that one;
           the reversed column shows it above. -->
      {#if stage === stages.length && canItemize}
        <button
          type="submit"
          formaction="?/itemize"
          class="mx-auto flex w-full max-w-[390px] items-center justify-center gap-2 rounded-xl border border-blue-100/80 bg-blue-50/90 py-3 text-xs font-bold text-emerald-800 active:scale-[0.98] disabled:opacity-40 lg:max-w-none"
          disabled={!canAdvance || !fitsReceipt || saving}
        >
          <Receipt size={16} aria-hidden="true" />
          Save &amp; Itemize
        </button>
      {/if}
    </nav>
  </div>

  <div class="hidden lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-4">
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
      {recurringMonths}
      {hidden}
      {important}
      tags={chosenTags}
    />
    {#if editing}{@render deleteButton()}{/if}
  </div>
</form>

{#if editing}
  <DeleteTransactionDialog bind:open={confirmingDelete} {description} />
{/if}

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

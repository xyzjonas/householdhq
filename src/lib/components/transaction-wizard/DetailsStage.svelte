<script lang="ts">
  import { formatMoney } from "#lib/format.ts";
  import { m } from "#paraglide/messages.js";
  import TagPicker from "./TagPicker.svelte";
  import ToggleRow from "./ToggleRow.svelte";
  import {
    isExpenseLike,
    type TransactionType,
    type WizardAccount,
    type WizardTag,
  } from "./types";

  let {
    type,
    accounts,
    suggestions,
    tagOptions,
    fallbackDescription = "",
    sourceId = $bindable(),
    targetId = $bindable(),
    description = $bindable(),
    date = $bindable(),
    time = $bindable(),
    recurring = $bindable(),
    recurringMonths = $bindable(),
    hidden = $bindable(),
    important = $bindable(),
    tags = $bindable(),
  }: {
    type: TransactionType;
    accounts: WizardAccount[];
    suggestions: string[];
    /** The existing tags. */
    tagOptions: WizardTag[];
    /** Used as the description when left empty (the category name). */
    fallbackDescription?: string;
    sourceId: number | null;
    targetId: number | null;
    description: string;
    date: string;
    time: string;
    recurring: boolean;
    recurringMonths: number;
    hidden: boolean;
    important: boolean;
    /** Names of the tags on the transaction. */
    tags: string[];
  } = $props();

  let descriptionInput = $state<HTMLInputElement>();

  export function focusDescription() {
    descriptionInput?.focus({ preventScroll: true });
  }

  const owned = $derived(accounts.filter((a) => !a.isOut));
  const outside = $derived(accounts.filter((a) => a.isOut));
  const targets = $derived(owned.filter((a) => a.id !== sourceId));
  const source = $derived(owned.find((a) => a.id === sourceId));
  const accountLabel = $derived(
    type === "INCOME"
      ? m.wizard_received_to()
      : type === "TRANSFER"
        ? m.wizard_from()
        : m.wizard_paid_from(),
  );
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-4 rounded-2xl bg-surface-50-950 p-4">
    <label class="label">
      <span class="wizard-label label-text">{accountLabel}</span>
      <select class="select" name="accountId" bind:value={sourceId} required>
        {#each owned as a (a.id)}
          <option value={a.id}>{a.name}</option>
        {/each}
      </select>
      {#if source}
        <small class="text-surface-600-400">
          {m.wizard_details_balance({ balance: formatMoney(source.balance) })}
        </small>
      {/if}
    </label>

    {#if type === "TRANSFER"}
      <label class="label">
        <span class="wizard-label label-text">{m.wizard_to()}</span>
        <select class="select" name="targetId" bind:value={targetId} required>
          <option value={null} disabled
            >{m.wizard_details_choose_account()}</option
          >
          {#each targets as a (a.id)}
            <option value={a.id}>{a.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    {#if isExpenseLike(type)}
      <label class="label">
        <span class="wizard-label label-text">{m.wizard_paid_to()}</span>
        <select class="select" name="targetId" bind:value={targetId}>
          {#each outside as a (a.id)}
            <option value={a.id}>{a.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    <label class="label">
      <span class="wizard-label label-text"
        >{m.wizard_details_description_merchant()}</span
      >
      <input
        class="input"
        bind:this={descriptionInput}
        name="description"
        list="wizard-suggestions"
        autocomplete="off"
        placeholder={fallbackDescription}
        bind:value={description}
      />
      <datalist id="wizard-suggestions">
        {#each suggestions as s (s)}<option value={s}></option>{/each}
      </datalist>
    </label>

    <div class="label">
      <span class="wizard-label label-text" aria-hidden="true"
        >{m.wizard_tags()}</span
      >
      <TagPicker bind:value={tags} options={tagOptions} />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <label class="label">
        <span class="wizard-label label-text">{m.wizard_details_date()}</span>
        <input class="input" type="date" bind:value={date} required />
      </label>
      <label class="label">
        <span class="wizard-label label-text">{m.wizard_details_time()}</span>
        <input class="input" type="time" bind:value={time} required />
      </label>
    </div>
  </div>

  <ul class="rounded-2xl bg-surface-50-950 px-4">
    <ToggleRow
      name="recurring"
      label={m.wizard_details_recurring_label()}
      description={m.wizard_details_recurring_hint()}
      bind:checked={recurring}
    />
    {#if recurring}
      <li class="border-b border-surface-200-800 py-3">
        <label class="label">
          <span class="wizard-label label-text"
            >{m.wizard_details_repeat_every()}</span
          >
          <input
            class="input"
            type="number"
            name="recurringMonths"
            inputmode="numeric"
            min="1"
            step="1"
            bind:value={recurringMonths}
            required
          />
        </label>
      </li>
    {/if}
    <ToggleRow
      name="isHidden"
      label={m.wizard_details_hidden_label()}
      description={m.wizard_details_hidden_hint()}
      bind:checked={hidden}
    />
    <ToggleRow
      name="isImportant"
      label={m.wizard_details_important_label()}
      description={m.wizard_details_important_hint()}
      bind:checked={important}
    />
  </ul>
</div>

<style scoped>
  .wizard-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: light-dark(#64748b, #94a3b8);
  }
</style>

<script lang="ts">
  import { formatMoney } from "#lib/format.ts";
  import ToggleRow from "./ToggleRow.svelte";
  import {
    isExpenseLike,
    type TransactionType,
    type WizardAccount,
  } from "./types";

  let {
    type,
    accounts,
    suggestions,
    sourceId = $bindable(),
    targetId = $bindable(),
    description = $bindable(),
    date = $bindable(),
    time = $bindable(),
    recurring = $bindable(),
    recurringMonths = $bindable(),
    hidden = $bindable(),
    important = $bindable(),
  }: {
    type: TransactionType;
    accounts: WizardAccount[];
    suggestions: string[];
    sourceId: number | null;
    targetId: number | null;
    description: string;
    date: string;
    time: string;
    recurring: boolean;
    recurringMonths: number;
    hidden: boolean;
    important: boolean;
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
      ? "Received to"
      : type === "TRANSFER"
        ? "From"
        : "Paid from",
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
          Balance {formatMoney(source.balance)}
        </small>
      {/if}
    </label>

    {#if type === "TRANSFER"}
      <label class="label">
        <span class="wizard-label label-text">To</span>
        <select class="select" name="targetId" bind:value={targetId} required>
          <option value={null} disabled>Choose account</option>
          {#each targets as a (a.id)}
            <option value={a.id}>{a.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    {#if isExpenseLike(type)}
      <label class="label">
        <span class="wizard-label label-text">Paid to</span>
        <select class="select" name="targetId" bind:value={targetId}>
          {#each outside as a (a.id)}
            <option value={a.id}>{a.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    <label class="label">
      <span class="wizard-label label-text">Description / merchant</span>
      <input
        class="input"
        bind:this={descriptionInput}
        name="description"
        list="wizard-suggestions"
        autocomplete="off"
        placeholder="e.g. Globus Hypermarket"
        bind:value={description}
      />
      <datalist id="wizard-suggestions">
        {#each suggestions as s (s)}<option value={s}></option>{/each}
      </datalist>
    </label>

    <div class="grid grid-cols-2 gap-3">
      <label class="label">
        <span class="wizard-label label-text">Date</span>
        <input class="input" type="date" bind:value={date} required />
      </label>
      <label class="label">
        <span class="wizard-label label-text">Time</span>
        <input class="input" type="time" bind:value={time} required />
      </label>
    </div>
  </div>

  <ul class="rounded-2xl bg-surface-50-950 px-4">
    <ToggleRow
      name="recurring"
      label="Recurring transaction"
      description="Repeat every few months"
      bind:checked={recurring}
    />
    {#if recurring}
      <li class="border-b border-surface-200-800 py-3">
        <label class="label">
          <span class="wizard-label label-text">Repeat every (months)</span>
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
      label="Hidden transaction"
      description="Hide from standard dashboard metrics"
      bind:checked={hidden}
    />
    <ToggleRow
      name="isImportant"
      label="Important transaction!"
      description="Pin to the priority feed"
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

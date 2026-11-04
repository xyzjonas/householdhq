<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const errors = $derived<Record<string, string[] | undefined>>(
    form?.errors ?? {},
  );
</script>

<svelte:head><title>New record · Household HQ</title></svelte:head>

<div class="mx-auto max-w-xl">
  <h1 class="mb-6 text-2xl font-extrabold">Add record</h1>

  <form
    method="POST"
    use:enhance
    class="flex flex-col gap-4 card border border-surface-200-800 p-6"
  >
    <label class="label">
      <span class="label-text">Description</span>
      <input
        class="input"
        name="description"
        required
        value={form?.values?.description ?? ""}
      />
      {#each errors.description ?? [] as msg (msg)}<small
          class="text-error-600-400">{msg}</small
        >{/each}
    </label>

    <label class="label">
      <span class="label-text">Amount</span>
      <input
        class="input"
        name="amount"
        type="number"
        step="0.01"
        min="0"
        required
        value={form?.values?.amount ?? ""}
      />
      {#each errors.amount ?? [] as msg (msg)}<small class="text-error-600-400"
          >{msg}</small
        >{/each}
    </label>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="label">
        <span class="label-text">From</span>
        <select class="select" name="sourceId" required>
          {#each data.accounts as a (a.id)}
            <option
              value={a.id}
              selected={String(a.id) === form?.values?.sourceId}
              >{a.name}</option
            >
          {/each}
        </select>
      </label>
      <label class="label">
        <span class="label-text">To</span>
        <select class="select" name="targetId" required>
          {#each data.accounts as a (a.id)}
            <option
              value={a.id}
              selected={form?.values?.targetId
                ? String(a.id) === form.values.targetId
                : a.isOut}>{a.name}</option
            >
          {/each}
        </select>
        {#each errors.targetId ?? [] as msg (msg)}<small
            class="text-error-600-400">{msg}</small
          >{/each}
      </label>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="label">
        <span class="label-text">Category</span>
        <select class="select" name="categoryId">
          <option value="">None</option>
          {#each data.categories as c (c.id)}
            <option
              value={c.id}
              selected={String(c.id) === form?.values?.categoryId}
              >{c.name}</option
            >
          {/each}
        </select>
      </label>
      <label class="label">
        <span class="label-text">Date</span>
        <input
          class="input"
          name="transactedAt"
          type="date"
          value={form?.values?.transactedAt ?? ""}
        />
      </label>
    </div>

    <div class="flex justify-end gap-3">
      <a href={resolve("/")} class="btn preset-tonal">Cancel</a>
      <button type="submit" class="btn preset-filled-surface-950-50"
        >Save</button
      >
    </div>
  </form>
</div>

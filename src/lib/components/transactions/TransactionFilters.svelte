<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import Search from "@lucide/svelte/icons/search";
  import SlidersHorizontal from "@lucide/svelte/icons/sliders-horizontal";
  import {
    NO_CATEGORY,
    PAGE_SIZES,
    activeFilterCount,
    flowOptions,
    parseView,
    sortOptions,
    statusOptions,
    viewQuery,
    type TransactionsView,
  } from "#lib/transactions-view.ts";

  type Option = { id: number; name: string };

  let {
    view,
    categories,
    accounts,
    tags,
  }: {
    view: TransactionsView;
    categories: Option[];
    accounts: Option[];
    tags: string[];
  } = $props();

  const active = $derived(activeFilterCount(view));

  /** Navigates with a clean query string rather than the raw form fields. */
  function apply(form: HTMLFormElement) {
    const fields = [...new FormData(form)].flatMap(([name, value]) =>
      typeof value === "string" ? [[name, value]] : [],
    );
    const next = parseView(new URLSearchParams(fields));
    void goto(resolve(`/transactions?${viewQuery(next)}`), {
      // A filter change, not a navigation: keep scroll position and focus.
      reset: false,
    });
  }

  const triState = [
    { id: "", label: "Any" },
    { id: "yes", label: "Yes" },
    { id: "no", label: "No" },
  ];
</script>

<form
  role="search"
  method="GET"
  action={resolve("/transactions")}
  class="flex flex-col gap-4 card border border-surface-200-800 p-4"
  onsubmit={(e) => {
    e.preventDefault();
    apply(e.currentTarget);
  }}
  onchange={(e) => e.currentTarget.requestSubmit()}
>
  <div class="flex flex-wrap items-end gap-3">
    <label class="flex min-w-60 flex-1 flex-col gap-1 text-sm font-medium">
      <span class="sr-only">Search transactions</span>
      <span class="field-group grid-cols-[auto_1fr]">
        <span class="label preset-tonal">
          <Search size={16} aria-hidden="true" />
        </span>
        <input
          class="input"
          type="search"
          name="q"
          placeholder="Search descriptions"
          value={view.search}
        />
      </span>
    </label>

    <label class="flex flex-col gap-1 text-sm font-medium">
      Sort by
      <select class="select" name="sort" value={view.sort}>
        {#each sortOptions as o (o.id)}
          <option value={o.id} selected={(view.sort || "date-desc") === o.id}>
            {o.label}
          </option>
        {/each}
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm font-medium">
      Per page
      <select class="select" name="size">
        {#each PAGE_SIZES as size (size)}
          <option value={size} selected={view.size === size}>{size}</option>
        {/each}
      </select>
    </label>

    <button type="submit" class="btn preset-filled-surface-950-50">
      Search
    </button>
  </div>

  <details open={active > 0} class="group">
    <summary
      class="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold"
    >
      <SlidersHorizontal size={16} aria-hidden="true" />
      Filters
      {#if active > 0}
        <span
          class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800"
        >
          {active} active
        </span>
      {/if}
    </summary>

    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <fieldset class="grid grid-cols-2 gap-2 sm:col-span-2">
        <legend class="mb-1 text-sm font-medium">Date</legend>
        <label class="flex flex-col gap-1 text-xs text-surface-600-400">
          From
          <input class="input" type="date" name="from" value={view.from} />
        </label>
        <label class="flex flex-col gap-1 text-xs text-surface-600-400">
          To (inclusive)
          <input class="input" type="date" name="to" value={view.to} />
        </label>
      </fieldset>

      <fieldset class="grid grid-cols-2 gap-2 sm:col-span-2">
        <legend class="mb-1 text-sm font-medium">Amount</legend>
        <label class="flex flex-col gap-1 text-xs text-surface-600-400">
          Min
          <input
            class="input"
            type="number"
            name="min"
            min="0"
            step="any"
            inputmode="decimal"
            value={view.minAmount}
          />
        </label>
        <label class="flex flex-col gap-1 text-xs text-surface-600-400">
          Max
          <input
            class="input"
            type="number"
            name="max"
            min="0"
            step="any"
            inputmode="decimal"
            value={view.maxAmount}
          />
        </label>
      </fieldset>

      <label class="flex flex-col gap-1 text-sm font-medium">
        Category
        <select class="select" name="category">
          <option value="" selected={view.category === ""}>All</option>
          <option value={NO_CATEGORY} selected={view.category === NO_CATEGORY}>
            Uncategorized
          </option>
          {#each categories as c (c.id)}
            <option value={c.id} selected={view.category === String(c.id)}>
              {c.name}
            </option>
          {/each}
        </select>
      </label>

      <label class="flex flex-col gap-1 text-sm font-medium">
        Type
        <select class="select" name="flow">
          <option value="" selected={view.flow === ""}>All</option>
          {#each flowOptions as o (o.id)}
            <option value={o.id} selected={view.flow === o.id}>
              {o.label}
            </option>
          {/each}
        </select>
      </label>

      <label class="flex flex-col gap-1 text-sm font-medium">
        Status
        <select class="select" name="status">
          <option value="" selected={view.status === ""}>All</option>
          {#each statusOptions as o (o.id)}
            <option value={o.id} selected={view.status === o.id}>
              {o.label}
            </option>
          {/each}
        </select>
      </label>

      {#each [{ name: "account", label: "Account (either side)", value: view.account }, { name: "source", label: "From account", value: view.source }, { name: "target", label: "To account", value: view.target }] as f (f.name)}
        <label class="flex flex-col gap-1 text-sm font-medium">
          {f.label}
          <select class="select" name={f.name}>
            <option value="" selected={f.value === ""}>Any</option>
            {#each accounts as a (a.id)}
              <option value={a.id} selected={f.value === String(a.id)}>
                {a.name}
              </option>
            {/each}
          </select>
        </label>
      {/each}

      <label class="flex flex-col gap-1 text-sm font-medium">
        Tag
        <select class="select" name="tag">
          <option value="" selected={view.tag === ""}>Any</option>
          {#each tags as tag (tag)}
            <option value={tag} selected={view.tag === tag}>{tag}</option>
          {/each}
        </select>
      </label>

      {#each [{ name: "important", label: "Important", value: view.important }, { name: "recurring", label: "Recurring", value: view.recurring }, { name: "hidden", label: "Hidden", value: view.hidden }] as f (f.name)}
        <label class="flex flex-col gap-1 text-sm font-medium">
          {f.label}
          <select class="select" name={f.name}>
            {#each triState as o (o.id)}
              <option value={o.id} selected={f.value === o.id}>
                {o.label}
              </option>
            {/each}
          </select>
        </label>
      {/each}
    </div>

    <p class="mt-4">
      <a class="anchor text-sm" href={resolve("/transactions")}>
        Reset search and filters
      </a>
    </p>
  </details>
</form>

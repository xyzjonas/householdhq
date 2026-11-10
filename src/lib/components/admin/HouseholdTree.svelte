<script lang="ts">
  import {
    TreeView,
    createTreeViewCollection,
  } from "@skeletonlabs/skeleton-svelte";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import House from "@lucide/svelte/icons/house";
  import type {
    HouseholdWithMembers,
    PublicUser,
  } from "#lib/server/core/types.ts";
  import HouseholdToolbar from "./HouseholdToolbar.svelte";
  import MemberRow from "./MemberRow.svelte";
  import { buildAdminTree, type AdminNode } from "./tree";
  import type { AdminFeedback } from "./types";

  let {
    households,
    users,
    currentUserId,
    feedback,
  }: {
    households: HouseholdWithMembers[];
    users: PublicUser[];
    currentUserId?: number;
    feedback: AdminFeedback | null;
  } = $props();

  const collection = $derived(
    createTreeViewCollection<AdminNode>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      nodeToChildren: (node) => node.children ?? [],
      rootNode: buildAdminTree(households, users),
    }),
  );
  const summary = $derived(
    `${households.length} ${households.length === 1 ? "household" : "households"}, ${users.length} ${users.length === 1 ? "user" : "users"}`,
  );

  // Every branch starts open, and so does one that appears later (a household
  // just created, the first user without a household).
  const branchIds = $derived([
    ...households.map((h) => `h${h.id}`),
    ...(collection.rootNode.children?.some((n) => n.kind === "unassigned")
      ? ["unassigned"]
      : []),
  ]);
  let known: string[] = [];
  let expanded = $state<string[]>([]);
  $effect(() => {
    const fresh = branchIds.filter((id) => !known.includes(id));
    if (fresh.length === 0) return;
    known = [...known, ...fresh];
    expanded = [...expanded, ...fresh];
  });

  // Only keys typed on the node itself are the tree's; the buttons, fields and
  // dialogs inside rows keep their own keyboard handling.
  const keepOwnKeys = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) e.stopPropagation();
  };
</script>

<TreeView
  {collection}
  expandedValue={expanded}
  onExpandedChange={(details) => (expanded = details.expandedValue)}
>
  <TreeView.Label class="sr-only">Households and their users</TreeView.Label>
  <p class="mb-2 text-sm text-surface-600-400">{summary}</p>
  <TreeView.Tree class="flex flex-col gap-2">
    {#each collection.rootNode.children ?? [] as node, index (node.id)}
      {@render treeNode(node, [index])}
    {/each}
  </TreeView.Tree>
</TreeView>

{#snippet treeNode(node: AdminNode, indexPath: number[])}
  <TreeView.NodeProvider value={{ node, indexPath }}>
    {#if node.children}
      <TreeView.Branch
        class="card border border-surface-200-800 bg-surface-50-950 p-2"
      >
        <TreeView.BranchControl
          class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface-100-900"
          onkeydown={keepOwnKeys}
        >
          <TreeView.BranchIndicator>
            <ChevronRight size={16} aria-hidden="true" />
          </TreeView.BranchIndicator>
          {#if node.kind === "household"}
            <House size={16} aria-hidden="true" />
          {/if}
          <TreeView.BranchText class="min-w-0 flex-1 truncate font-bold">
            {node.name}
          </TreeView.BranchText>
          <span class="text-xs text-surface-600-400">
            {node.children.filter((c) => c.kind === "member").length}
            {node.children.length === 1 ? "user" : "users"}
          </span>
        </TreeView.BranchControl>
        <TreeView.BranchContent
          class="ml-4 flex flex-col border-l border-surface-200-800 pl-3"
        >
          {#if node.household}
            <HouseholdToolbar
              household={node.household}
              {users}
              households={households.map(({ id, name }) => ({ id, name }))}
              {feedback}
            />
          {/if}
          {#if node.children.length === 0}
            <p class="py-2 text-sm text-surface-600-400">
              Nobody belongs here yet.
            </p>
          {/if}
          {#each node.children as child, i (child.id)}
            {@render treeNode(child, [...indexPath, i])}
          {/each}
        </TreeView.BranchContent>
      </TreeView.Branch>
    {:else if node.user}
      <TreeView.Item
        class="border-t border-surface-200-800 pl-0! first:border-t-0"
        onkeydown={keepOwnKeys}
      >
        <!-- The tree cancels the default action of every click reaching a row
             (it selects the row), which would swallow the form buttons. -->
        <div
          class="min-w-0 flex-1"
          role="presentation"
          onclick={(e) => e.stopPropagation()}
        >
          <MemberRow
            user={node.user}
            isSelf={node.user.id === currentUserId}
            household={households.find((h) => node.id.startsWith(`h${h.id}/`))}
          />
        </div>
      </TreeView.Item>
    {/if}
  </TreeView.NodeProvider>
{/snippet}

<template>
  <div class="card flex flex-col gap-2 overflow-y-scroll">
    <balance-account-type-collapsible
      v-for="(accounts, key) in allGroups"
      :sources="accounts"
      :type="key"
    />
  </div>
</template>
<script setup lang="ts">
import { type Source } from "@/types";

const props = defineProps<{
  upcomming?: number;
  sources: Source[];
  spent: number;
}>();

const allGroups = computed(() => {
  const partitioned: Record<string, Source[]> = {};
  props.sources.forEach((source) => {
    partitioned[source.type] = [...(partitioned[source.type] ?? []), source];
  });
  return partitioned;
});
</script>

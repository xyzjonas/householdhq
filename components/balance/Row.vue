<template>
  <div class="flex flex-col justify-between card">
    <div class="flex flex-col gap-5">
      <balance-account-type-collapsible
        v-for="(accounts, key) in accounts"
        :sources="accounts"
        :type="key"
      />
    </div>
    <hr class="mt-auto" />
    <div class="flex w-full justify-end items-center h-[2rem]">
      <ui-button
        link
        flat
        icon-left="i-ic-baseline-arrow-forward"
        @click="navigateTo('/sources')"
        >{{ $t("s_navigate_to") }}</ui-button
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { type Source } from "@/types";

const props = defineProps<{
  upcomming?: number;
  sources: Source[];
  spent: number;
}>();

const accounts = computed(() => {
  const partitioned: Record<string, Source[]> = {};
  props.sources.forEach((source) => {
    partitioned[source.type] = [...(partitioned[source.type] ?? []), source]
  });
  return partitioned;
});
</script>

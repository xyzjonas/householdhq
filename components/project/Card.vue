<template>
  <div
    class="flex items-center justify-between card hover:cursor-pointer hover:underline relative"
    @click="navigateTo(`/projects/${project.id}`)"
  >
    <div class="flex items-center gap-3">
      <span class="color-flag"></span>
      <div class="flex flex-col">
        <span>{{ project.name }}</span>
        <span class="text-xs opacity-[0.6]"
          >{{ project.transactions.length }} {{ $t("transactions") }}</span
        >
      </div>
    </div>
    <div class="flex items-center gap-2">
      <ui-price :amount="total" size="1rem" />
    </div>
    <div
      v-if="project.isCompleted"
      class="absolute right-2 top-2 flex items-center opacity-[0.7] gap-1"
    >
      <i
        class="i-ic-baseline-check-circle-outline text-lg"
        style="color: var(--color-success)"
      ></i>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type Project } from "@/types";

const props = defineProps<{ project: Project }>();

const { total } = useProject(toRef(props.project));
</script>
<style lang="scss" scoped>
.color-flag {
  width: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: v-bind("project.color ?? 'gray'");
}
</style>

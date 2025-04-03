<template>
  <div
    class="flex items-center justify-between dark:hover:bg-gray-8 light:hover:bg-gray-3 hover:cursor-pointer px-2 py-1 border-rounded transition-all"
    @click="navigateTo(`/projects/${project.id}`)"
  >
    <div class="flex items-center gap-3">
      <span class="color-flag"></span>
      <span>{{ project.name }}</span>
    </div>
    <div class="flex flex-col items-center line-height-tight">
      <ui-price :amount="total - paidSoFar" size="1.2rem" />
      <div class="flex items-center text-[0.7rem] gap-1">
        <span class="opacity-[0.5]">{{ $t("p_out_of") }}</span>
        <ui-price :amount="total" size="0.8rem" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type Project } from "@/types";

const props = defineProps<{ project: Project }>();

const { total, paidSoFar } = useProject(toRef(props.project));
</script>
<style lang="scss" scoped>
.color-flag {
  width: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: v-bind("project.color ?? 'gray'");
}
</style>

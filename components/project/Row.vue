<template>
  <ui-list-row
    @click="navigateTo(`/projects/${project.id}`)"
    class="flex justify-between"
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
  </ui-list-row>
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

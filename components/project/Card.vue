<template>
  <div
    class="flex items-center justify-between card hover:cursor-pointer hover:underline"
    @click="navigateTo(`/projects/${project.id}`)"
  >
    <div class="flex items-center gap-3">
      <span class="color-flag"></span>
      <span class="label">{{ project.name }}</span>
    </div>
    <!-- <div
      v-if="source.isPortfolio"
      class="circle-sm"
      style="background-color: var(--color-success)"
    ></div> -->
  </div>
</template>
<script setup lang="ts">
import { type Project } from "@/types";

const props = defineProps<{ project: Project }>();
</script>
<style lang="scss" scoped>
.color-flag {
  width: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: v-bind("project.color ?? 'gray'");
}
</style>

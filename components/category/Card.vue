<template>
  <div
    class="flex items-center justify-between card hover:cursor-pointer hover:underline"
    @click="navigateTo(`/categories/${category.id}`)"
  >
    <div class="flex items-center gap-3">
      <span class="color-flag"></span>
      <span class="label">{{ category.name }}</span>
    </div>
    <!-- <div
      v-if="source.isPortfolio"
      class="circle-sm"
      style="background-color: var(--color-success)"
    ></div> -->
  </div>
</template>
<script setup lang="ts">
import { sourceIcons, type Source } from "@/types";
import type { Category } from "@prisma/client";

const props = defineProps<{ category: Category }>();
</script>
<style lang="scss" scoped>
.color-flag {
  width: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: v-bind("category.color ?? 'gray'");
}
</style>

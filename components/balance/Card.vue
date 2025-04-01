<template>
  <div
    class="flex items-center justify-between card hover:cursor-pointer hover:underline"
    @click="navigateTo(`/sources/${source.id}`)"
  >
    <div class="flex items-center gap-3">
      <span class="color-flag"></span>
      <i :class="sourceIcons[source.type]"></i>
      <span class="label">{{ source.name }}</span>
    </div>
    <div
      v-if="source.isPortfolio"
      class="circle-sm"
      style="background-color: var(--color-success)"
    ></div>
  </div>
</template>
<script setup lang="ts">
import { sourceIcons, type Source } from "@/types";

const props = defineProps<{ source: Source }>();
</script>
<style lang="scss" scoped>
.color-flag {
  width: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: v-bind("source.color ?? 'gray'");
}
</style>

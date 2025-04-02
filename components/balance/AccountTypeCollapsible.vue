<template>
  <div>
    <div
      class="flex justify-between items-center dark:hover:bg-gray-8 light:hover:bg-gray-3 hover:cursor-pointer px-2 py-1 border-rounded transition-all"
      @click="collapsed = !collapsed"
    >
      <span class="flex items-center gap-2">
        <i
          :class="`i-ic-chevron-left rotate-[-${
            collapsed ? 180 : 90
          }deg] transition`"
        ></i>
        <i :class="sourceIcons[type as SourceType]"></i>
        <h3>{{ $t(type as string) }}</h3>
      </span>
      <span class="flex">
        <ui-price
          :amount="sources.reduce((sum, src) => src.sum + sum, 0)"
          size="1.3rem"
          :class="collapsed ? '' : 'opacity-[0.4]'"
        />
      </span>
    </div>
    <transition name="slide" mode="out-in">
      <div v-if="!collapsed" class="pl-2">
        <BalanceItem v-for="source in sources" :source="source" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { sourceIcons, type Source, type SourceType } from "~/types";

const props = defineProps<{
  sources: Source[];
  type: any;
}>();

const collapsed = useLocalStorage(`${props.type}-collapsed`, true);
</script>
<style lang="css" scoped></style>

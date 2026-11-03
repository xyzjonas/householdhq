<template>
  <div>
    <button
      type="button"
      class="group-toggle"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      <span class="flex items-center gap-2">
        <i
          class="i-ic-chevron-left transition"
          :style="`transform: rotate(-${collapsed ? 180 : 90}deg)`"
        ></i>
        <i :class="sourceIcons[group.type]"></i>
        <h3>{{ $t(group.type) }}</h3>
      </span>
      <ui-price
        :amount="group.total"
        size="1.3rem"
        :class="collapsed ? '' : 'opacity-[0.4]'"
      />
    </button>
    <transition name="slide" mode="out-in">
      <ul v-if="!collapsed" class="pl-2 m-0 list-none">
        <home-portfolio-item
          v-for="source in group.sources"
          :key="source.id"
          :source="source"
        />
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { sourceIcons } from "~/types";
import type { HomePortfolioGroup } from "~/types/home";

const props = defineProps<{ group: HomePortfolioGroup }>();

// shared with the pre-existing listing, read after hydration to stay in sync
const collapsed = useLocalStorage(`${props.group.type}-collapsed`, true, {
  initOnMounted: true,
});
</script>

<style scoped>
.group-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2.5rem;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

h3 {
  margin: 0;
  text-transform: uppercase;
}
</style>

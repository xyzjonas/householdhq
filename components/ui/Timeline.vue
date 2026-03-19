<template>
  <TransitionGroup
    :name="transitionName"
    tag="div"
    class="timeline"
    :style="{ '--timeline-color': color || '#cccccc' }"
  >
    <div
      v-for="(item, index) in items"
      :key="resolveKey(item, index)"
      class="timeline-item"
    >
      <div class="timeline-rail">
        <span class="timeline-dot" />
        <span v-if="index < items.length - 1" class="timeline-line" />
      </div>

      <div class="timeline-content">
        <slot
          name="item"
          :item="item"
          :index="index"
          :is-last="index === items.length - 1"
        />
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts" generic="ItemType extends object">
import type { VNode } from "vue";

type ItemKey = string | number;

const props = withDefaults(
  defineProps<{
    items: ItemType[];
    itemKey?: keyof ItemType | ((item: ItemType, index: number) => ItemKey);
    color?: string;
    transitionName?: string;
  }>(),
  {
    itemKey: undefined,
    color: undefined,
    transitionName: "timeline-slide",
  },
);

defineSlots<{
  item(props: { item: ItemType; index: number; isLast: boolean }): VNode[];
}>();

const resolveKey = (item: ItemType, index: number): ItemKey => {
  if (!props.itemKey) {
    return index;
  }

  if (typeof props.itemKey === "function") {
    return props.itemKey(item, index);
  }

  const value = item[props.itemKey];
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return index;
};
</script>

<style lang="scss" scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline-slide-enter-active,
.timeline-slide-leave-active,
.timeline-slide-move {
  transition: all 0.22s ease;
}

.timeline-slide-enter-from,
.timeline-slide-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.timeline-rail {
  position: relative;
  width: 1.25rem;
  flex-shrink: 0;
  align-self: stretch;
}

.timeline-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 9999px;
  background: var(--timeline-color);
  box-shadow: 0 0 0 0.2rem
    color-mix(in srgb, var(--timeline-color) 20%, transparent);
}

.timeline-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% + 0.75rem);
  border-radius: 9999px;
  background: linear-gradient(
    to bottom,
    var(--timeline-color),
    color-mix(in srgb, var(--timeline-color) 25%, transparent)
  );
}

.timeline-content {
  flex: 1;
  min-width: 0;
}
</style>

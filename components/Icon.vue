<template>
  <i v-if="icon" :class="icon"></i>
</template>

<script lang="ts" setup>
defineOptions({ name: "AppIcon" });

const props = defineProps<{ iconName?: string | null }>();

const icon = computed(() =>
  props.iconName ? `fa-solid fa-${props.iconName}` : "",
);
</script>
<style lang=""></style>

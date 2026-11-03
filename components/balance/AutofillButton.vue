<template>
  <ui-button
    :loading="updating"
    icon="i-ic-baseline-auto-fix-high"
    @click="onAutoUpdate"
    >{{ $t("s_state_autocomplete") }}</ui-button
  >
</template>

<script setup lang="ts">
const props = defineProps<{ sourceId: number }>();

const { autoCompleteSourceState } = useSourcesStore();

const updating = ref(false);
const onAutoUpdate = () => {
  autoCompleteSourceState(props.sourceId, updating);
};
</script>
<style lang="css" scoped></style>

<template>
  <div class="flex flex-col card">
    <project-row
      v-for="proj in projects.filter((proj) => !proj.isCompleted)"
      :project="proj"
    />
    <div
      class="flex items-center"
      v-if="projects.filter((proj) => !proj.isCompleted).length <= 0"
    >
      <span class="flex-1 opacity-[0.7]">{{ $t("p_none") }}</span>
      <ui-button
        link
        flat
        icon-left="i-ic-baseline-arrow-forward"
        @click="navigateTo('/projects')"
        class="ml-auto flex-2"
        >{{ $t("p_navigate_to") }}</ui-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
const projectsStore = useProjectsStore();
const { projects } = storeToRefs(projectsStore);
</script>

<style lang="css" scoped></style>

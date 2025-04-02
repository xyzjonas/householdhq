<template>
  <div
    class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
  >
    <project-card
      :project="project"
      v-for="project in projects"
      class="aspect-ratio-[2]"
    />
    <div class="new-source-card card">
      <h2>new project</h2>
      <div class="">
        <ui-input label="name" v-model="newProject.name" />
        <ui-input label="description" v-model="newProject.description" />
        <ui-input
          label="estimate"
          type="number"
          inputmode="numeric"
          v-model="newProject.estimate"
        />
        <ui-button
          @click="createProject()"
          :loading="loading"
          :disabled="Object.keys(newProject).length === 0"
          >{{ $t("t_send") }}</ui-button
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSourcesStore } from "@/stores/sources";
import { storeToRefs } from "pinia";
import { useProjectsStore } from "~/stores/projects";
import type { CreateProject } from "~/types";

const projectsStore = useProjectsStore();
const { projects, loading } = storeToRefs(projectsStore);
await projectsStore.fetchAllProjects();

const newProjectName = ref();
const newProject = ref<Partial<CreateProject>>({});
const createProject = () => {
  projectsStore
    .createProject(newProject.value as CreateProject)
    .then(() => (newProject.value = {}));
};
</script>

<style lang="css" scoped>
.new-source {
  display: flex;
  gap: 0.3rem;
}

.input-box {
  flex: 3;
}

button {
  flex: 1;
}

h2 {
  font-weight: 400;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}
</style>
\

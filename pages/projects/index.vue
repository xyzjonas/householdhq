<template>
  <div>
    <ui-button
      outlined
      icon="i-ic-baseline-plus"
      class="mb-3"
      @click="openModal = true"
      >{{ $t("p_new") }}</ui-button
    >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <project-card
        v-for="project in projects"
        :key="project.id"
        :project="project"
        class="aspect-ratio-[3]"
      />
    </div>
    <client-only>
      <teleport to="body">
        <ui-modal v-model="openModal">
          <form class="card w-sm flex flex-col gap-2">
            <h2 class="uppercase mb-3">{{ $t("p_new") }}</h2>
            <ui-input v-model="newProject.name" :label="$t('p_name')" />
            <ui-input
              v-model="newProject.description"
              :label="$t('p_description')"
            />
            <ui-input
              v-model="newProject.estimate"
              :label="$t('p_estimate')"
              type="number"
              inputmode="numeric"
            />
            <ui-button
              :loading="loading"
              :disabled="Object.keys(newProject).length === 0"
              width="100%"
              height="3rem"
              class="mt-3"
              type="submit"
              color="primary"
              @click="createProject()"
              >{{ $t("t_send") }}</ui-button
            >
          </form> </ui-modal
        >"
      </teleport>
    </client-only>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useProjectsStore } from "~/stores/projects";
import type { CreateProject } from "~/types";

const projectsStore = useProjectsStore();
const { projects, loading } = storeToRefs(projectsStore);
await projectsStore.fetchAllProjects();

const openModal = ref(false);

const newProject = ref<Partial<CreateProject>>({});
const createProject = () => {
  projectsStore
    .createProject(newProject.value as CreateProject)
    .then(() => (newProject.value = {}))
    .then(() => (openModal.value = false));
};
</script>

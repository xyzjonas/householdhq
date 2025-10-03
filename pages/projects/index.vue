<template>
  <div>
    <ui-button
      outlined
      icon="i-ic-baseline-plus"
      @click="openModal = true"
      class="mb-3"
      >{{ $t("p_new") }}</ui-button
    >
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <project-card
        :project="project"
        v-for="project in projects"
        class="aspect-ratio-[3]"
      />
    </div>
    <client-only>
      <teleport to="body">
        <ui-modal v-model="openModal">
          <form class="card w-sm flex flex-col gap-2">
            <h2 class="uppercase mb-3">{{ $t("p_new") }}</h2>
            <ui-input :label="$t('p_name')" v-model="newProject.name" />
            <ui-input
              :label="$t('p_description')"
              v-model="newProject.description"
            />
            <ui-input
              :label="$t('p_estimate')"
              type="number"
              inputmode="numeric"
              v-model="newProject.estimate"
            />
            <ui-button
              @click="createProject()"
              :loading="loading"
              :disabled="Object.keys(newProject).length === 0"
              width="100%"
              height="3rem"
              class="mt-3"
              type="submit"
              color="primary"
              >{{ $t("t_send") }}</ui-button
            >
          </form> </ui-modal
        >"
      </teleport>
    </client-only>
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

const openModal = ref(false);

const newProjectName = ref();
const newProject = ref<Partial<CreateProject>>({});
const createProject = () => {
  projectsStore
    .createProject(newProject.value as CreateProject)
    .then(() => (newProject.value = {}))
    .then(() => (openModal.value = false));
};
</script>

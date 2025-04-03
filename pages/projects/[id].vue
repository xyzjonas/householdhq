<template>
  <div>
    <div v-if="project" class="flex-col">
      <section class="row title">
        <div class="flex flex-col">
          <h1 class="uppercase text-3xl">{{ project.name }}</h1>
          <div class="flex gap-2 ml-1">
            <ui-price :amount="paidSoFar" size="1rem" />
            <span class="text-xl">/</span>
            <ui-price :amount="total" size="1rem" />
          </div>
        </div>
        <Transition name="page" mode="out-in">
          <spinner v-show="loading" class="item" />
        </Transition>
      </section>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("name") }}</p>
          <small></small>
        </div>
        <form-editable-field
          :value="project.name"
          keyName="name"
          @send="(data: string) => patchProject(data)"
          class="item"
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("description") }}</p>
          <small></small>
        </div>
        <form-editable-field
          :value="project.description"
          keyName="description"
          @send="(data: string) => patchProject(data)"
          class="item"
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("p_estimate") }}</p>
          <small></small>
        </div>
        <form-editable-field
          :value="project.estimate"
          keyName="estimate"
          @send="(data: string) => patchProject(data)"
          type="number"
          inputmode="numeric"
          class="item"
        />
      </div>

      <div class="card flex gap-5 justify-between items-center">
        <div class="text-gray-5 capitalize">{{ $t("color") }}</div>
        <form-editable-color
          keyName="color"
          :value="project.color || '#ffffffff'"
          @send="(data: string) => patchProject(data)"
        />
      </div>

      <div class="row card">
        <div class="row-label">
          <p class="item">{{ $t("p_completed") }}</p>
          <p class="desc">{{ $t("p_completed_desc") }}</p>
        </div>
        <form-editable-boolean
          keyName="isCompleted"
          :value="project.isCompleted"
          @send="(data: string) => patchProject(data)"
          class="item"
        />
      </div>

      <h1 class="title container mb-2 mt-3">
        {{ project.transactions.length }} Transactions
      </h1>
      <div class="flex flex-col gap-10">
        <transaction-monthly-listing :transactions="project.transactions" />
      </div>

      <!-- <div class="row card">
          <div class="row-label">
            <p class="item">{{ $t("delete") }}</p>
            <p class="desc">{{ $t("delete_desc") }}</p>
          </div>
          <div class="item">
            <ui-button
              @click="deleteSource"
              icon="i-ic-baseline-delete"
              :loading="sourceLoading"
              squared
              color="danger"
            />
          </div>
        </div> -->
    </div>
    <error-banner v-else status="404" message="not found" :is-login="false" />
  </div>
</template>

<script setup lang="ts">
import type { Project } from "~/types";

const route = useRoute();
const id = parseInt(route.params.id as string);
const { data, error, refresh } = await useFetch<{ data: Project }>(
  `/api/projects/${id}`
);

const projectsStore = useProjectsStore();
const { loading } = storeToRefs(projectsStore);

const project = computed(() => data.value?.data as Project);

const patchProject = async (data: any) => {
  await projectsStore.patchProject(project.value?.id, data);
  await refresh();
};

const { total, paidSoFar } = useProject(project);
</script>

<style lang="scss" scoped>
.flex-col {
  gap: 0.3rem;
}

.row,
.card {
  min-height: 5rem;
}

.row-label {
  filter: contrast(0.7);

  p {
    text-transform: capitalize;
  }

  .desc {
    font-size: small;
    line-height: 100%;
    filter: contrast(0.3) opacity(0.5);
    text-transform: none;
  }
}

.state-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem;
  border-radius: 0.3rem;

  :nth-child(2) {
    margin-left: auto;
  }

  &:nth-child(even) {
    backdrop-filter: brightness(0.8);
  }
}
</style>

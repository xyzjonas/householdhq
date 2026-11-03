<template>
  <section v-if="projects.length > 0" class="card flex flex-col">
    <ul class="flex flex-col m-0 p-0 list-none">
      <li v-for="project in projects" :key="project.id">
        <NuxtLink
          :to="`/projects/${project.id}`"
          class="flex items-center justify-between gap-3 hover:underline"
        >
          <span class="flex items-center gap-3">
            <span
              class="color-flag"
              :style="{ backgroundColor: project.color ?? 'gray' }"
            />
            <span class="flex flex-col">
              <span>{{ project.name }}</span>
              <span class="text-xs opacity-[0.6]"
                >{{ project.transactionCount }} {{ $t("transactions") }}</span
              >
            </span>
          </span>
          <ui-price :amount="project.total" size="1rem" />
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const { data } = useHomeProjects();

const projects = computed(() => data.value?.items ?? []);
</script>

<style scoped>
.color-flag {
  width: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
}
</style>

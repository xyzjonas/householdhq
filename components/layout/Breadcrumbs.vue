<template>
  <div v-if="pathSegments.length" class="crumbs py-4 mb-3 text-gray-5 text-md">
    <NuxtLink to="/" class="segment">Home</NuxtLink>
    <span v-for="(segment, index) in pathSegments">
      <i class="i-ic-baseline-chevron-right mx-2"></i>
      <NuxtLink
        :to="`/${pathSegments.slice(0, index + 1).join('/')}`"
        class="segment capitalize"
        >{{ localizeRouteSegment(segment) }}
      </NuxtLink>
    </span>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const pathSegments = computed(() => {
  const fullPath = route.fullPath;

  if (fullPath === "/login") {
    return [];
  }

  const path = route.fullPath.split("?")[0] as string;
  return path.split("/").filter((s) => s);
});

const { t } = useI18n();
function localizeRouteSegment(segment: string) {
  const localizable = ["sources", "categories", "projects", "important"];
  if (localizable.includes(segment)) {
    return t(`route_${segment}`);
  } else {
    return segment;
  }
}
</script>

<style scoped lang="scss">
.crumbs {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid var(--bg-300);

  span {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}

a {
  transition: 0.3s ease-in-out;

  &:hover {
    color: var(--text-100);
  }
}

.segment {
  margin-inline: 1px;
  transition: 0.2s color;
}

.crumbs span:last-child .segment {
  font-weight: 600;
  color: var(--primary-100);
}
</style>

<template>
  <div v-if="pathSegments.length" class="crumbs">
    <NuxtLink id="home" to="/" class="segment i-ic-baseline-home" />
    <span v-for="(segment, index) in pathSegments">
      <i class="i-ic-baseline-chevron-right"></i>
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

  const path = route.fullPath.split("?")[0];
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
#home {
  font-size: larger;
  transform: translateY(-1px);
}

.crumbs {
  display: flex;
  flex-direction: row;
  margin-bottom: 1.5em;
  color: var(--text-100);
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--bg-300);

  span {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}

a {
  color: var(--text-100);
  transition: 0.3s ease-in-out;

  &:hover {
    filter: opacity(0.8);
  }
}

.caret {
  margin-left: 1em;
  margin-right: 1em;
  font-size: 0.8em;
}

.segment {
  margin-inline: 8px;
  transition: 0.2s color;
}
</style>

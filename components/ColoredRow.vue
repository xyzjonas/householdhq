<template>
  <NuxtLink :to="link" class="transaction">
    <h5 class="ml-5">{{ title }}</h5>
    <div class="ml-auto mr-2">
      <slot />
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{ link: string; color?: string; title: string }>();
</script>

<style lang="scss" scoped>
.transaction {
  border: 0;
  border-left: solid 0.3rem;
  border-left-color: v-bind("color") !important;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  transition: 0.2s;
  margin: 0;

  &:hover {
    border-left: solid 1rem;
  }
}

.wrapper {
  display: flex;
  flex-direction: row;
  cursor: pointer;

  .panel {
    overflow: hidden;
    display: flex;
    align-items: center;
    transition: 250ms;
    padding-top: 0.25em;
    padding-bottom: 0.25em;

    .y {
      flex-direction: column;
    }

    button {
      height: 100%;
      width: 4em;
      margin-left: 5px;
      flex: auto;
    }
  }
}

h5 {
  text-transform: uppercase;
  font-size: 1.1em;
}

.transaction {
  border: 1px solid var(--border-100);
  border-radius: 0.3rem;
}
</style>

<template>
  <main>
    <slot></slot>
  </main>
</template>
<style lang="scss" scoped>
main {
  position: absolute;
  display: grid;
  inset: 0;
  align-content: center;
  justify-content: center;
  align-items: center;
}
</style>

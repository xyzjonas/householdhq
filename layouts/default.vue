<template>
    <div class="page-wrapper">
        <Breadcrumbs />
        <slot />
    </div>
</template>
<style lang="scss" scoped>
.page-wrapper {
  margin-inline: auto;
  padding-block: 1rem;
  width: min(100% - .7rem, 960px);
}

footer {
    margin-top: 2rem;
    background-color: var(--accent-100);
}
</style>

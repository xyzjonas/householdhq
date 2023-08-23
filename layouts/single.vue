<template>
    <div class="single-center">
        <slot />
    </div>
</template>
<style lang="scss" scoped>
.single-center {
    min-height: 100vh;
    display: grid;
    align-items: center;
    padding: 8px;
    height: 100%;

    // padding: 0 16px;
}
</style>

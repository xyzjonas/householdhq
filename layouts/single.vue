<template>
    <layout-base>
        <div class="main">
            <slot />
        </div>
    </layout-base>
</template>
<style lang="scss" scoped>

.main {
    position: absolute;
    display: grid;
    inset: 0;
    align-content: center;
}
</style>

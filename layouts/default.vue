<template>
    <div>
        <div>
            <div class="app-wrapper">
                <Breadcrumbs />
                <slot />
            </div>
        </div>
    </div>
</template>
<script>
import { Breadcrumbs } from '#components';

export default {
    component: { Breadcrumbs }
}
</script>
<style lang="">
    
</style>
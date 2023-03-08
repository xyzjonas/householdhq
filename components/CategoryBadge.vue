<template>
    <div style="color: #ccccccff">
        <Icon v-if="category && category.icon" :iconName="category.icon" />
        <div v-else-if="category && category.name" class="tag">
            <p style="color: white; text-decoration: none;">
                {{ alt }}
            </p>
        </div>
        <div v-else>
            ///
        </div>
    </div>
</template>
<script>
import { Icon } from '#components';
export default {
    components: { Icon },
    props: ['category'],

    computed: {
        alt() {
            if(this.category && this.category.name) {
                return this.category.name.slice(0, 2).toUpperCase();
            }
        }
    }
}
</script>
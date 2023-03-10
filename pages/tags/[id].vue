<script setup>
    const route = useRoute()
    const { data: tag } = await useFetch(`/api/tags/${route.params.id}`)
</script>
<template>
    <div class="container">
        <h1 class="title">{{ tag.name }}</h1>
        <div class="row">
            <div class="item">Description</div>
            <EditableField class="item" :value="tag.description"/>
            <!-- <div class="item">{{ tag.description }}</div> -->
        </div>
        <div class="row">
            <div class="item">Icon</div>
            <div class="item">{{ tag.icon }}</div>
        </div>
        <div class="row">
            <div class="item">Parent</div>
            <div class="item">{{ tag.parentId }}</div>
        </div>
        <div class="row">
            <div class="item">Child</div>
            <div class="item">{{ childTag }}</div>
        </div>
        <div class="row">
            <div class="item">Color</div>
            <div class="item">
                <p class="color-circle" :style="`background-color: ${tag.color}`"></p>
            </div>
            <!-- <div class="item">{{ tag.color }}</div> -->
        </div>
    </div>
</template>
<script>
import { EditableField } from '#components';

export default {

    components: { EditableField },

    computed: {
        childTag() {
            console.info(this.tag)
            if (this.tag && this.tag.childTags && this.tag.childTags.length > 0) {
                return this.childTags[0];
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.color-circle {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    border: 1px solid;
    border-color: var(--color-grey-dark-3);
    margin-right: 0;
}
.row {
    padding-top: 0.1em;
    padding-bottom: 0.1em;
}
</style>
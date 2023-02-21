<script setup>
    const route = useRoute()
    const { data: tag } = await useFetch(`/api/tags/${route.params.id}`)
</script>
<template lang="">
    <div>
        <h1>{{ tag.name }}</h1>
        <div class="box">
            <div class="item">Description</div>
            <div class="item">{{ tag.description }}</div>
        </div>
        <div class="box">
            <div class="item">Icon</div>
            <div class="item">{{ tag.icon }}</div>
        </div>
        <div class="box">
            <div class="item">Parent</div>
            <div class="item">{{ tag.parentId }}</div>
        </div>
        <div class="box">
            <div class="item">Child</div>
            <div class="item">{{ childTag }}</div>
        </div>
    </div>
</template>
<script>
export default {
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
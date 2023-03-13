<template>
    <div class="container more-p">
        <div v-if="loading" class="center"><MosaicLoader /></div>
        <div v-else-if="tag.id">
            <h1 class="title">{{ tag.name }}</h1>
            <div class="row">
                <div class="item">{{ $t('name') }}</div>
                <EditableField
                    :value="tag.name"
                    keyName="name"
                    @send="patchTag"
                    class="item"
                />
            </div>
            <div class="row">
                <div class="item">{{ $t('description') }}</div>
                <EditableField
                    keyName="description"
                    :value="tag.description"
                    @send="patchTag"
                    class="item"
                />
            </div>
            <div class="row">
                <div class="item">{{ $t('icon') }}</div>
                <EditableField
                    keyName="icon"
                    :value="tag.icon"
                    @send="patchTag"
                    class="item"
                />
            </div>
            <div class="row">
                <div class="item">{{ $t('tag_parent') }}</div>
                <div class="item">{{ tag.parentId || $t('tag_no_parent') }}</div>
            </div>
            <div class="row">
                <div class="item">{{ $t('tag_child') }}</div>
                <div class="item">{{ childTag || $t('tag_no_child')}}</div>
            </div>

            <div class="row">
                <div class="item">{{ $t('color') }}</div>
                <div class="item">
                    <EditableColor
                        keyName="color"
                        :value="tag.color || '#ffffffff'"
                        @send="patchTag"
                    />
                    </div>
            </div>
        </div>
        <div v-else class="center">
            NOT FOUND
        </div>
    </div>
</template>
<script>
import { EditableField, EditableColor, MosaicLoader } from '#components';

export default {

    components: { EditableField, EditableColor, MosaicLoader },

    computed: {
        childTag() {
            if (this.tag && this.tag.childTags && this.tag.childTags.length > 0) {
                return this.tag.childTags[0].id;
            }
        }
    },

    data() {
        return {
            loading: false,
            tag: {}
        }
    },
    
    methods: {
        getTag() {
            this.loading = true;
            const url = `/api/tags/${this.tagId}`;
            $fetch(url, {method: 'GET'})
            .then(res => this.tag = res.data)
            .finally(() => this.loading = false)
        },
        patchTag(tagData) {
            const url = "/api/tags";
            console.info(tagData)
            tagData.id = this.tag.id;
            $fetch(url, {method: 'PATCH', body: tagData})
                .then(res => this.tag = res.data)
                .finally(() => { this.patching = false; this.edit = false; this.details = false })
        }
    },

    setup() {
        const route = useRoute();
        const tagId = route.params.id
        return { tagId }
    },

    created() {
        this.getTag();
    }
}
</script>
<style lang="scss" scoped>

.title {
    border-color: v-bind('tag.color');
    color: v-bind('tag.color');
}

.title {
    text-transform: uppercase;
}
.row {
    margin-top: 0.1em;
    margin-bottom: 0.1em;
    min-height: 1.8em;

    .item:first-child {
        text-transform: capitalize;
        filter: contrast(0.2);
    }
}
</style>
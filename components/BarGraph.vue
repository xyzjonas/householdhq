<template>
    <div>
        <section v-if="items.length === 0" class="center">
            <h1>{{ $t('no_data') }}</h1>
        </section>

        <transition name="slide" mode="out-in">
        <div v-if="selectedCategory > 0" class="graph">
            <BarGraphRow v-for="tag in displayedTags"
                :tag="tag"
                :selected="tag.id === selectedCategory"
                @toggle="tagId => toggleSelected(tagId)"
            />
        </div>
        <div v-else class="graph">
            <BarGraphRow v-for="tag in displayedTags"
                :tag="tag"
                :max="max"
                @toggle="tagId => toggleSelected(tagId)"
            />
        </div>
        </transition>

        <div v-show="selectedCategory > 0">
            <TagDetails :tagId="selectedCategory"  @cancel="toggleSelected(selectedCategory)"/>
        </div>
    </div>
</template>
<script>
import { Price, TagDetails, BarGraphRow } from '#components';

export default {

    components: { Price, TagDetails, BarGraphRow },

    props: [ 'items' ],

    data() {
        return {
            selectedCategory: -1,
            max: 0,
        }
    },

    computed: {
        displayedTags() {
            if (this.selectedCategory < 0) {
                return this.items;
            }
            return this.items.filter(t => t.id === this.selectedCategory);
        },
    },

    created() {
        let max = 0;
        Object.values(this.items).forEach(t => {
            if (t.sum > max) { max = t.sum; }
        })
        this.max = max;
    },

    methods: {
        light_or_dark(colorHex) {
            if (colorHex) {
                let color = colorHex.startsWith("#") ? colorHex.replace("#", "") : colorHex;
                const r = parseInt(color.substring(0, 2), 16); // hexToR
                const g = parseInt(color.substring(2, 4), 16); // hexToG
                const b = parseInt(color.substring(4, 6), 16); // hexToB
                return (r*0.299 + g*0.587 + b*0.114) > 186;
            }
            return false
        },
        toggleSelected(tagId) {
            console.info(`hooo: ${tagId}`)
            if (this.selectedCategory === tagId) {
                this.selectedCategory = -1;
            } else {
                this.selectedCategory = tagId;
            }
            this.$emit('filter', this.selectedCategory);
        },
        getTagWidth(tag) {
            if (tag.id === this.selectedCategory) {
                return 100;
            }
            return tag.sum / max * this.loaded;
        }
    },
}
</script>

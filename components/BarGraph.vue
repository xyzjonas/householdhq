<template>
    <div>
        <div class="graph">
            <div
                v-for="tag in displayedTags" :to="`/tags/${tag.tag.id}`"
                @click="toggleSelected(tag.tag.id)"
                class="row-wrapper"
                :style="`color: ${light_or_dark(tag.tag.color) ? '#2b2b2b': '#faf9f9'}; text-shadow: 0px 0px 2px #fff;`"
            >
                <p class="label" :style="`background-color: ${tag.tag.color}`">{{ tag.tag.name }}</p>
                <div class="bar-wrapper">
                    <p class="bar" 
                        :style="`width: ${tag.tag.id === selected ? 100 : (tag.sum / max * loaded)}%; background-color: ${tag.tag.color}`">
                        <Price
                            :amount="tag.sum"
                            :currency="tag.transactions[0].currency"
                            style="margin-left: 0.5em;"
                        />
                    </p>
                </div>
            </div>
        </div>
        <div v-show="selected > 0">
            <TagDetails :tagId="selected" />
        </div>
    </div>
</template>
<script>
import { Price, TagDetails } from '#components';

export default {

    components: { Price, TagDetails },

    props: [ 'tags' ],

    data() {
        return {
            loaded: 0,
            selected: -1,
        }
    },

    computed: {
        displayedTags() {
            if (this.selected < 0) {
                return this.tags;
            }
            return this.tags.filter(t => t.tag.id === this.selected);
        },
        max() {
            let max = 0;
            Object.values(this.tags).forEach(t => {
                if (t.sum > max) {
                    max = t.sum;
                }
            })
            return max
        },
    },

    methods: {
        light_or_dark(color) {
            if (color) {
                return color && parseInt(color.replace('#', ''), 16) > 12000000;
            }
            return false
        },
        toggleSelected(tagId) {
            if (this.selected === tagId) {
                this.selected = -1;
            } else {
                this.selected = tagId;
            }
            this.$emit('filter', this.selected);
        },
        getTagWidth(tag) {
            if (tag.tag.id === this.selected) {
                return 100;
            }
            return tag.sum / max * loaded
        }
    },

    created() {
        setTimeout(() => {
            this.loaded = 100;
        }, 100)
    }
}
</script>
